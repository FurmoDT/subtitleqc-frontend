import {createContext, useCallback, useEffect, useState} from "react";
import axios from "./axios";
import {HttpStatusCode} from "axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [userState, setUserState] = useState({})

    const updateAccessToken = useCallback((accessToken) => {
        return new Promise((resolve) => {
            if (accessToken) {
                axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`
                return axios.get('/v1/auth/get_current_user').then((response) => {
                    setUserState({
                        isAuthenticated: true,
                        user: {
                            userId: response.data.user_id,
                            userEmail: response.data.user_email,
                            userRole: response.data.user_role
                        }
                    })
                    resolve(accessToken);
                })
            } else {
                delete axios.defaults.headers.common.Authorization
                setUserState({})
                resolve(accessToken);
            }
        });
    }, []);

    useEffect(() => {
        axios.post('/v1/auth/refresh').then((response) => {
            if (response.status === HttpStatusCode.Ok) return updateAccessToken(response.data.access_token).then()
        }).finally(() => setIsInitialized(true))
    }, [updateAccessToken])

    if (isInitialized) return (<AuthContext.Provider value={{userState, updateAccessToken}}>
        {children}
    </AuthContext.Provider>);
};
