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
        return new Promise((resolve, reject) => {
            if (!userState.isAuthenticated) {
                wsRef.current?.close(4000)
                reject()
                return
            }
            if (wsRef.current) {
                reject()
                return
            }
            wsRef.current = new WebSocket(`${process.env.NODE_ENV === 'development' ? localWsUrl : wsUrl}/v1/ws`)
            wsRef.current.onopen = () => {
                wsRef.current.send(accessTokenRef.current)
                resolve()
                console.log('ws opened')
            }
            wsRef.current.onclose = (event) => {
                wsRef.current = null
                if (event.code === 1008) axios.post('v1/auth/refresh').then((response) => {
                    return updateAccessToken(response.data.access_token).then(() => connect())
                })
                setWebsocketConnected(false)
                console.log('ws closed')
            }
            wsRef.current.onerror = (error) => {
                wsRef.current = null
                setWebsocketConnected(false)
                console.log('ws closed on error')
            }
        })
    }, [userState, accessTokenRef, updateAccessToken])

    useEffect(() => {
        connect().then(() => setWebsocketConnected(true)).catch(() => null)
    }, [connect, userState])

    return <WebsocketContext.Provider value={{wsRef, websocketConnected}}>
        {children}
    </WebsocketContext.Provider>;
};
