import {createContext, useEffect, useState} from "react";
import axios from "./axios";
import {HttpStatusCode} from "axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [userState, setUserState] = useState({
        accessToken: null,
    });
    const [fetchAccessTokenCompleted, setFetchAccessTokenCompleted] = useState(false)
    useEffect(() => {
        axios.post('/v1/auth/refresh').then((response) => {
            if (response.status === HttpStatusCode.Ok) setUserState({accessToken: response.data.access_token})
        }).finally(() => setFetchAccessTokenCompleted(true))
    }, [])
    useEffect(()=>{
        if (userState.accessToken) axios.defaults.headers.common.Authorization = `Bearer ${userState.accessToken}`
    }, [userState])
    return (<AuthContext.Provider value={{userState, setUserState, fetchAccessTokenCompleted}}>
        {children}
    </AuthContext.Provider>);
};
