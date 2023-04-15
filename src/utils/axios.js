import Axios from "axios";
import {apiUrl} from "./config";

const axios = Axios.create({
    baseURL: apiUrl
});

axios.defaults.withCredentials = true;

export default axios;
