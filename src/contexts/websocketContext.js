import {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {localWsUrl, wsUrl} from "../utils/config";
import {AuthContext} from "./authContext";
import axios from "../utils/axios";

export const WebsocketContext = createContext(null);

export const WebsocketProvider = ({children}) => {
    const [websocketConnected, setWebsocketConnected] = useState(false)
    const {userState, accessTokenRef, updateAccessToken} = useContext(AuthContext)
    const wsRef = useRef(null)

    const connect = useCallback(() => {
        return new Promise((resolve) => {
            if (!accessTokenRef.current) {
                if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close(4000)
                resolve()
                return
            }
            if (wsRef.current) {
                resolve()
                return
            }
            wsRef.current = new WebSocket(`${process.env.NODE_ENV === 'development' ? localWsUrl : wsUrl}/v1/ws`)
            wsRef.current.onopen = () => {
                wsRef.current.send(accessTokenRef.current)
                resolve()
                console.log('ws opened')
            }
            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data)
                if (data.type === 'connected') setWebsocketConnected(true)
            }
            wsRef.current.onclose = (event) => {
                setWebsocketConnected(false)
                wsRef.current = null
                if (event.code === 1008) axios.post('v1/auth/refresh', null, {withCredentials: true}).then((response) => updateAccessToken(response.data.access_token))
                else if (event.code === 4000) {
                } else setTimeout(() => connect(), 5000)
                console.log('ws closed')
            }
            wsRef.current.onerror = (error) => console.log('ws closed on error')
        })
    }, [accessTokenRef, updateAccessToken])

    useEffect(() => {
        connect().then()
    }, [connect, userState])

    return <WebsocketContext.Provider value={{wsRef, websocketConnected}}>
        {children}
    </WebsocketContext.Provider>;
};
