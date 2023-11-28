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

const CrdtHandler = forwardRef(({setCrdtInitialized, setCrdtAwarenessState, ...props}, ref) => {
    const {sessionId} = useContext(SessionContext)
    const {userState} = useContext(AuthContext);
    const [iceservers, setIceServers] = useState(null)
    const [connectionType, setConnectionType] = useState(navigator.connection.effectiveType)
    const {wsRef, isOnline, websocketConnected} = useContext(WebsocketContext)
    const yDocRef = useRef(null)
    const awarenessRef = useRef(null)
    const roomId = `${props.taskHashedId}`

    useImperativeHandle(ref, () => ({
        yDoc: () => yDocRef.current,
        yMap: () => yDocRef.current.getMap(roomId),
        awareness: () => awarenessRef.current
    }), [roomId])

    useEffect(() => {
        if (!props.taskHashedId || !iceservers) return

        const yDoc = new Y.Doc()
        yDocRef.current = yDoc
        const provider = new WebrtcProvider(roomId, yDoc, {
            signaling: [`${process.env.NODE_ENV === 'development' ? localWsUrl : wsUrl}/v1/webrtc`],
            maxConns: 20,
            peerOpts: {config: {iceServers: iceservers}}
        })
        const awareness = provider.awareness
        awarenessRef.current = awareness
        awareness.setLocalStateField('user', {
            id: userState.user.userId,
            name: userState.user.userName,
            email: userState.user.userEmail,
            connectedAt: Date.now()
        })

        const persistence = new IndexeddbPersistence(`crdt-${sessionId}-${roomId}`, yDoc)
        persistence.whenSynced.then(() => {
            axios.get('v1/task/content', {params: {hashed_id: props.taskHashedId}}).then((r) => {
                if (r.data) Y.applyUpdate(yDoc, toUint8Array(r.data.task_crdt))
            }).finally(() => setCrdtInitialized(true))
        })

        yDoc.on('update', (update, origin, doc, tr) => {
            if (websocketConnected && props.taskHashedId) {
                wsRef.current.send(JSON.stringify({room_id: `${roomId}`, update: fromUint8Array(update)}))
            }
        })

        return () => {
            setCrdtInitialized(false)
            provider.disconnect()
            provider.destroy()
            yDoc.destroy()
        }
    }, [props.taskHashedId, roomId, setCrdtInitialized, setCrdtAwarenessState, sessionId, userState, iceservers, wsRef, websocketConnected]);

    useEffect(() => {
        const connection = navigator.connection
        const handleConnectionChange = () => setConnectionType(connection.effectiveType)
        navigator.connection.addEventListener('change', handleConnectionChange)
        return () => navigator.connection.removeEventListener('change', handleConnectionChange)
    }, [])

    useEffect(() => {
        axios.get(`v1/twilio/iceservers`).then((response) => setIceServers(response.data))
    }, [isOnline, connectionType])

    return <></>
})
export default CrdtHandler
