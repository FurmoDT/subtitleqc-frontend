import axios from "./axios";
import AWS from "aws-sdk"

export const s3Upload = (taskId, files) => {
    axios.get('v1/aws/sts/s3').then((response) => {
        const s3 = new AWS.S3({
            accessKeyId: response.data.access_key,
            secretAccessKey: response.data.secret_access_key,
            sessionToken: response.data.session_token,
            region: response.data.region,
        })
        files.forEach((file) => {
            const upload = new AWS.S3.ManagedUpload({
                params: {
                    Bucket: response.data.bucket,
                    Key: `task/${taskId}/${file.name}`,
                    Body: file,
                },
                service: s3
            })
            upload.promise().then((response) => console.log(response)).catch((reason) => console.log(reason))
        })
    })
}
