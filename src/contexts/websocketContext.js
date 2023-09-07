import {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {localWsUrl, wsUrl} from "../utils/config";
import {AuthContext} from "./authContext";
import axios from "../utils/axios";
import {HttpStatusCode} from "axios";

export const WebsocketContext = createContext(null);

export const WebsocketProvider = ({children}) => {
    const [isInitialized, setIsInitialized] = useState(false)
    const [isOnline, setIsOnline] = useState(navigator.onLine)
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
                resolve()
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
                if (event.code !== 4000) axios.post('/v1/auth/refresh').then((response) => {
                    if (response.status === HttpStatusCode.Ok) return updateAccessToken(response.data.access_token).then(() => setTimeout(connect, 10000))
                })
                console.log('ws closed')
            }
        })
    }, [userState, accessTokenRef, updateAccessToken])

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
        if (isOnline) connect().then().catch(() => null).finally(() => setIsInitialized(true))
    }, [connect, isOnline, userState])

    return isInitialized && <WebsocketContext.Provider value={{wsRef, isOnline}}>
        {children}
    </WebsocketContext.Provider>;
};
