import Axios from "axios";
import {apiUrl, localApiUrl} from "./config";

const axios = Axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? localApiUrl : apiUrl,
    withCredentials: true
});

export default axios;
