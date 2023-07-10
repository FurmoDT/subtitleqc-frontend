import axios from "./axios";
import AWS from "aws-sdk"

export const aws = (taskId, files) => {
    axios.get('v1/aws/sts/s3').then((response) => {
        AWS.config.update({
            accessKeyId: response.data.access_key,
            secretAccessKey: response.data.secret_access_key,
            sessionToken: response.data.session_token,
            region: response.data.region,
        });
        files.forEach((file) => {
            const upload = new AWS.S3.ManagedUpload({
                params: {
                    Bucket: response.data.bucket,
                    Key: `task/${taskId}/${file.name}`,
                    Body: file,
                }
            })
            upload.promise().then((response) => console.log(response)).catch((reason) => console.log(reason))
        })
    })
}
