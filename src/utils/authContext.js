import {createContext, useEffect, useState} from "react";
import axios from "./axios";
import {HttpStatusCode} from "axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [userState, setUserState] = useState({});
    const [fetchAccessTokenCompleted, setFetchAccessTokenCompleted] = useState(false)
    useEffect(() => {
        axios.post('/v1/auth/refresh').then((response) => {
            if (response.status === HttpStatusCode.Ok) setUserState({accessToken: response.data.access_token})
        }).finally(() => setFetchAccessTokenCompleted(true))
    }, [])
    useEffect(() => {
        if (userState.accessToken) {
            axios.defaults.headers.common.Authorization = `Bearer ${userState.accessToken}`
            axios.get('/v1/auth/get_current_user').then((response) => {
                setUserState({...userState, userName: response.data.user_name})
            })
        }
    }, [userState])
    return (<AuthContext.Provider value={{userState, setUserState, fetchAccessTokenCompleted}}>
        {children}
    </AuthContext.Provider>);
};
