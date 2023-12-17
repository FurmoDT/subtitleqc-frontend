import {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {localWsUrl, wsUrl} from "../utils/config";
import {AuthContext} from "./authContext";
import axios from "../utils/axios";

export const WebsocketContext = createContext(null);

export const WebsocketProvider = ({children}) => {
    const [websocketConnected, setWebsocketConnected] = useState(false)
    const {userState, accessTokenRef, updateAccessToken} = useContext(AuthContext)
    const wsRef = useRef(null)
    const pingIntervalRef = useRef(null)
    const pingTimeoutRef = useRef(null)

    const connect = useCallback(() => {
        return new Promise((resolve) => {
            if (wsRef.current) {
                if (!accessTokenRef.current) wsRef.current?.close(4000)
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
                if (data.type === 'connected') {
                    setWebsocketConnected(true)
                    pingIntervalRef.current = setInterval(() => {
                        if (wsRef.current.readyState === WebSocket.OPEN) {
                            wsRef.current.send(JSON.stringify({type: 'ping'}))
                            pingTimeoutRef.current = setTimeout(() => {
                                if (wsRef.current) {
                                    console.log('ws ping timeout')
                                    wsRef.current.close()
                                }
                            }, 4000)
                        } else {
                            clearInterval(pingIntervalRef.current)
                            setWebsocketConnected(false)
                            wsRef.current = null
                            connect().then()
                        }
                    }, 5000)
                } else if (data.type === 'pong') {
                    clearTimeout(pingTimeoutRef.current)
                }
            }
            wsRef.current.onclose = (event) => {
                clearInterval(pingIntervalRef.current)
                setWebsocketConnected(false)
                wsRef.current = null
                if (event.code === 1008) axios.post('v1/auth/refresh').then((response) => {
                    return updateAccessToken(response.data.access_token).then(() => connect())
                })
                else if (event.code === 4000) {
                } else setTimeout(() => connect(), 5000)
                console.log('ws closed')
            }
            wsRef.current.onerror = (error) => {
                console.log('ws closed on error')
            }
        })
    }, [accessTokenRef, updateAccessToken])

    useEffect(() => {
        connect().then()
    }, [connect, userState])

    return <WebsocketContext.Provider value={{wsRef, websocketConnected}}>
        {children}
    </WebsocketContext.Provider>;
};
