import {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {localWsUrl, wsUrl} from "./config";
import {AuthContext} from "./authContext";
import axios from "./axios";
import {HttpStatusCode} from "axios";

export const WebsocketContext = createContext(null);

export const WebsocketProvider = ({children}) => {
    const [isInitialized, setIsInitialized] = useState(false)
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const {accessTokenRef, updateAccessToken} = useContext(AuthContext)
    const wsRef = useRef(null)
    const connect = useCallback(() => {
        return new Promise((resolve, reject) => {
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
            wsRef.current.onclose = () => {
                wsRef.current = null
                axios.post('/v1/auth/refresh').then((response) => {
                    if (response.status === HttpStatusCode.Ok) return updateAccessToken(response.data.access_token).then()
                }).finally(() => setTimeout(connect, 10000))
                console.log('ws closed')
            }
        })
    }, [accessTokenRef, updateAccessToken])

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [])

    useEffect(() => {
        if (isOnline) connect().then(() => setIsInitialized(true))
        return () => {
            wsRef.current?.close()
        }
    }, [connect, isOnline])

    return isInitialized && <WebsocketContext.Provider value={{wsRef, isOnline}}>
        {children}
    </WebsocketContext.Provider>;
};
