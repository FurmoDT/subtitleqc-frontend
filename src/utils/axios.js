import Axios, {HttpStatusCode} from "axios";
import {apiUrl, localApiUrl} from "./config";
import {useContext, useEffect} from "react";
import {AuthContext} from "./authContext";

const axios = Axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? localApiUrl : apiUrl
});

axios.defaults.withCredentials = true;

function AxiosInterceptor({children}) {
    const {updateAccessToken} = useContext(AuthContext);

    useEffect(() => {
        const resInterceptor = (response) => {
            return response;
        };
        const errInterceptor = (error) => {
            if (error.response.status === HttpStatusCode.Unauthorized) {
                return axios.post(`/v1/auth/refresh`).then((response) => {
                    if (response.status === HttpStatusCode.Ok) {
                        return updateAccessToken(response.data.access_token).then((accessToken) => {
                            error.config.headers.Authorization = `Bearer ${accessToken}`
                            return axios.request(error.config).then(retryResponse => {
                                return retryResponse
                            })
                        })

                    }
                })
            }
            return Promise.reject(error);
        };
        const interceptor = axios.interceptors.response.use(resInterceptor, errInterceptor);
        return () => axios.interceptors.response.eject(interceptor);
    }, [updateAccessToken]);

    return children
}

export default axios;
export {AxiosInterceptor};
