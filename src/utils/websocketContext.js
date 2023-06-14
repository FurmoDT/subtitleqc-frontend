import {createContext, useEffect, useRef, useState} from "react";
import {localWsUrl, wsUrl} from "./config";

export const WebsocketContext = createContext(null);

export const WebsocketProvider = ({children}) => {
    const [isInitialized, setIsInitialized] = useState(false)
    const wsRef = useRef(null)

    useEffect(() => {
        wsRef.current = new WebSocket(`${process.env.NODE_ENV === 'development' ? localWsUrl : wsUrl}/v1/ws`)
        wsRef.current.onopen = () => console.log('ws opened')
        wsRef.current.onclose = () => console.log('ws closed')
        setIsInitialized(true)
        return () => {
            wsRef.current.close()
        }
    }, [])

    return isInitialized && <WebsocketContext.Provider value={{wsRef}}>
        {children}
    </WebsocketContext.Provider>;
};
