import axios from "../axios";

export const getSts = async () => {
    return axios.get('v1/aws/sts/client').then(r => ({
        accessKeyId: r.data.access_key,
        secretAccessKey: r.data.secret_access_key,
        sessionToken: r.data.session_token,
        region: r.data.region,
        bucket: r.data.bucket,
    }))
}
