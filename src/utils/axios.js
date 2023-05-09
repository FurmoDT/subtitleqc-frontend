import Axios, {HttpStatusCode} from "axios";
import {apiUrl} from "./config";
import {useContext, useEffect} from "react";
import {AuthContext} from "./authContext";

const axios = Axios.create({
    baseURL: apiUrl
});

axios.defaults.withCredentials = true;

function AxiosInterceptor({children}) {
    const {userState, setUserState} = useContext(AuthContext);
    useEffect(() => {
        const resInterceptor = (response) => {
            return response;
        };
        const errInterceptor = (error) => {
            if (error.response.status === HttpStatusCode.BadRequest && error.config.url !== '/v1/auth/refresh') {
                return axios.post(`/v1/auth/refresh`).then((response) => {
                    if (response.status === HttpStatusCode.Ok) {
                        setUserState({...userState, accessToken: response.data.access_token})
                        //TODO Retry prev API call (error)
                    }
                })
            } else if (error.response.status === HttpStatusCode.BadRequest) return error
            return Promise.reject(error);
        };
        const interceptor = axios.interceptors.response.use(
            resInterceptor,
            errInterceptor
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, [userState, setUserState]);
    return children
}

export default axios;
export {AxiosInterceptor};
