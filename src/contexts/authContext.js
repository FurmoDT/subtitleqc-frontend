import {createContext, useCallback, useEffect, useRef, useState} from "react";
import axios from "../utils/axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const initiatedRef = useRef(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const userRef = useRef(null)
    const accessTokenRef = useRef(null)

    const updateAccessToken = useCallback((accessToken) => {
        return new Promise((resolve) => {
            if (accessToken) {
                accessTokenRef.current = accessToken
                axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`
                return axios.get('v1/auth/get_current_user').then((response) => {
                    userRef.current = {
                        userId: response.data.user_id,
                        userName: response.data.user_name,
                        userEmail: response.data.user_email,
                        userRole: response.data.user_role
                    }
                    setIsAuthenticated(true)
                    resolve(accessToken);
                })
            } else {
                accessTokenRef.current = null
                userRef.current = null
                delete axios.defaults.headers.common.Authorization
                setIsAuthenticated(false)
                resolve(accessToken);
            }
        });
    }, []);

    useEffect(() => {
        if (initiatedRef.current) return
        initiatedRef.current = true
        axios.post('v1/auth/refresh', null, {withCredentials: true}).then((response) => updateAccessToken(response.data.access_token).then()).catch(() => null).finally(() => setIsInitialized(true))
    }, [updateAccessToken])

    return isInitialized && <AuthContext.Provider value={{isAuthenticated, userRef, accessTokenRef, updateAccessToken}}>
        {children}
    </AuthContext.Provider>;
};
