import {forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react";
import axios from "../../../utils/axios";
import * as Y from "yjs";
import {fromUint8Array, toUint8Array} from "js-base64";
import {WebsocketContext} from "../../../contexts/websocketContext";
import {WebrtcProvider} from "y-webrtc";
import {localWsUrl, wsUrl} from "../../../utils/config";
import {IndexeddbPersistence} from "y-indexeddb";
import {SessionContext} from "../../../contexts/sessionContext";
import {AuthContext} from "../../../contexts/authContext";
import {generateHexColor} from "../../../utils/functions";

const CrdtHandler = forwardRef(({setCrdtInitialized, setCrdtAwarenessInitialized, ...props}, ref) => {
    const {sessionId} = useContext(SessionContext)
    const {userState} = useContext(AuthContext);
    const [iceservers, setIceServers] = useState(null)
    const {wsRef, websocketConnected} = useContext(WebsocketContext)
    const yDocRef = useRef(null)
    const providerRef = useRef(null)
    const awarenessRef = useRef(null)
    const offlineUpdate = useRef(null)
    const roomId = props.taskHashedId

    useImperativeHandle(ref, () => ({
        yDoc: () => yDocRef.current,
        yMap: () => yDocRef.current.getMap(roomId),
        awareness: () => awarenessRef.current
    }), [roomId])

    useEffect(() => {
        if (roomId && websocketConnected) axios.get(`v1/twilio/iceservers`).then((response) => setIceServers(response.data))
        else setIceServers(null)
    }, [roomId, sessionId, userState, websocketConnected])

    useEffect(() => {
        if (!roomId) return

        const yDoc = new Y.Doc()
        yDocRef.current = yDoc

        const persistence = new IndexeddbPersistence(`crdt-${sessionId}-${roomId}`, yDoc)
        persistence.whenSynced.then(() => {
            axios.get('v1/task/content', {params: {hashed_id: roomId}}).then((r) => {
                if (r.data) Y.applyUpdate(yDoc, toUint8Array(r.data.task_crdt))
            }).finally(() => setCrdtInitialized(true))
        })

        yDoc.on('update', (update, origin, doc, tr) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({room_id: `${roomId}`, update: fromUint8Array(update)}))
                if (origin === 'local') props.menuToolbarRef.current.showSavingStatus(false)
                else props.menuToolbarRef.current.showSavingStatus(true)
            } else {
                offlineUpdate.current = offlineUpdate.current ? Y.mergeUpdates([offlineUpdate.current, update]) : update
            }
        })
        return () => {
            setCrdtInitialized(false)
            yDoc.destroy()
            yDocRef.current = null
        }
    }, [roomId, sessionId, setCrdtInitialized, wsRef, props.menuToolbarRef])

    useEffect(() => {
        if (!iceservers) {
            providerRef.current?.destroy()
            providerRef.current = null
            setCrdtAwarenessInitialized(false)
            return
        }

        const provider = new WebrtcProvider(roomId, yDocRef.current, {
            signaling: [`${process.env.NODE_ENV === 'development' ? localWsUrl : wsUrl}/v1/webrtc`],
            maxConns: 20,
            peerOpts: {config: {iceServers: iceservers}}
        })
        providerRef.current = provider

        const awareness = provider.awareness
        awarenessRef.current = awareness
        awareness.setLocalStateField('user', {
            id: userState.user.userId,
            name: userState.user.userName,
            email: userState.user.userEmail,
            color: generateHexColor(),
            connectedAt: Date.now()
        })
        if (offlineUpdate.current) {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    room_id: `${roomId}`, update: fromUint8Array(offlineUpdate.current)
                }))
                props.menuToolbarRef.current.showSavingStatus(true)
                offlineUpdate.current = null
            }
        }
        setCrdtAwarenessInitialized(true)
    }, [roomId, userState, iceservers, setCrdtAwarenessInitialized, wsRef, props.menuToolbarRef]);

    return <></>
})
export default CrdtHandler
