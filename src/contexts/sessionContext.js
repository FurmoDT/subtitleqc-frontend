import {createContext, useCallback, useEffect, useMemo} from "react";
import {v4} from "uuid";

export const SessionContext = createContext(null);

export const SessionProvider = ({children}) => {
    const sessions = useMemo(() => new Set(), [])
    const sessionChannel = useMemo(() => ({channel: new BroadcastChannel('session')}), [])
    const sessionId = useMemo(() => v4(), [])

    useEffect(() => {
        sessionChannel.channel.onmessage = (evt) => {
            const [key, value] = evt.data.split(':')
            if (key === 'join') sessionChannel.channel.postMessage(`echo:${sessionId}`)
            if (key === 'echo') sessions.add(value)
        }
        return () => {
            sessionChannel.channel.close()
            sessionChannel.channel = new BroadcastChannel('session')
        }
    }, [sessions, sessionChannel, sessionId])

    const refreshSessions = useCallback(() => {
        sessions.clear() || sessions.add(sessionId)
        return new Promise((resolve, reject) => {
            sessionChannel.channel.postMessage(`join:${sessionId}`) // receive echo
            setTimeout(() => resolve(sessions), 5000)
        })
    }, [sessions, sessionChannel, sessionId])

    useEffect(() => {
        window.indexedDB.databases().then(databaseList => {
            refreshSessions().then((sessions) => {
                databaseList.forEach(database => {
                    if (database.name.startsWith('crdt')) {
                        if (!sessions.has(database.name.split('-').slice(1, 6).join('-'))) {
                            window.indexedDB.deleteDatabase(database.name)
                        }
                    }
                })
            })
        })
    }, [sessions, refreshSessions])

    return <SessionContext.Provider value={{sessionId}}>
        {children}
    </SessionContext.Provider>;
};
