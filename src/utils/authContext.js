import {createContext, useEffect, useState} from "react";
import axios from "./axios";
import {HttpStatusCode} from "axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [userState, setUserState] = useState({});
    useEffect(() => {
        axios.post('/v1/auth/refresh').then((response) => {
            if (response.status === HttpStatusCode.Ok) setAccessToken(response.data.access_token)
        }).catch(() => setIsInitialized(true))
    }, [])
    useEffect(() => {
        if (accessToken) {
            axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`
            axios.get('/v1/auth/get_current_user').then((response) => {
                setUserState({
                    isAuthenticated: true,
                    user: {userEmail: response.data.user_email, userRole: response.data.user_role}
                })
            }).finally(() => setIsInitialized(true))
        } else {
            delete axios.defaults.headers.common.Authorization
            setUserState({})
        }
    }, [accessToken])
    if (isInitialized) return (<AuthContext.Provider value={{accessToken, setAccessToken, userState, setUserState}}>
        {children}
    </AuthContext.Provider>);
};
