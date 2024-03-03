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
    const {userRef} = useContext(AuthContext);
    const [iceservers, setIceServers] = useState(null)
    const {wsRef, websocketConnected} = useContext(WebsocketContext)
    const yDocRef = useRef(null)
    const providerRef = useRef(null)
    const awarenessRef = useRef(null)
    const offlineUpdate = useRef(null)
    const [yDocInitialized, setYDocInitialized] = useState(false)
    const roomId = props.taskHashedId

    useImperativeHandle(ref, () => ({
        yDoc: () => yDocRef.current,
        yMap: () => yDocRef.current.getMap('subtitle'),
        awareness: () => awarenessRef.current
    }), [])

    useEffect(() => {
        if (websocketConnected) axios.get(`v1/twilio/iceservers`).then((response) => setIceServers(response.data))
        else setIceServers(null)
    }, [sessionId, websocketConnected])

    useEffect(() => {
        const yDoc = new Y.Doc()
        yDocRef.current = yDoc

        const persistence = new IndexeddbPersistence(`crdt-${sessionId}-${roomId}`, yDoc)
        persistence.whenSynced.then(() => {
            axios.get(`v1/tasks/content/${roomId}`).then((r) => {
                if (r.data) Y.applyUpdate(yDoc, toUint8Array(r.data.task_crdt), 'initialize')
            }).finally(() => setYDocInitialized(true))
        })

        yDoc.on('update', (update, origin, doc, tr) => {
            if (origin === 'initialize') return
            if (origin === 'local') {
                wsRef.current.send(JSON.stringify({room_id: `${roomId}`, update: fromUint8Array(update)}))
                props.menuToolbarRef.current.showSavingStatus(false)
                // offlineUpdate.current = offlineUpdate.current ? Y.mergeUpdates([offlineUpdate.current, update]) : update
            }
        })
        return () => {
            yDoc.destroy()
            yDocRef.current = null
        }
    }, [roomId, sessionId, wsRef, props.menuToolbarRef])

    useEffect(() => {
        if (!yDocInitialized) return
        if (!iceservers) {
            setCrdtAwarenessInitialized(false)
            providerRef.current?.destroy()
            providerRef.current = null
            return
        }
        if (providerRef.current) return
        const provider = new WebrtcProvider(roomId, yDocRef.current, {
            signaling: [`${process.env.NODE_ENV === 'development' ? localWsUrl : wsUrl}/v1/webrtc`],
            maxConns: 20,
            peerOpts: {config: {iceServers: iceservers}}
        })
        providerRef.current = provider
        const awareness = provider.awareness
        awarenessRef.current = awareness
        awareness.setLocalStateField('user', {
            id: userRef.current.userId,
            name: userRef.current.userName,
            email: userRef.current.userEmail,
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
        setCrdtInitialized(true)
        setCrdtAwarenessInitialized(true)
        console.log('provider connected')
    }, [roomId, userRef, iceservers, yDocInitialized, setCrdtInitialized, setCrdtAwarenessInitialized, wsRef, props.menuToolbarRef]);

    return <></>
})
export default CrdtHandler
