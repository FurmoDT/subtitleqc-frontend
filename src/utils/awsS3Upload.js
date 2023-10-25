import axios from "./axios";
import AWS from "aws-sdk"
import {fileExtension} from "./functions";

export const s3Upload = (taskId, fileVersion, files, setUploadProgress) => {
    return new Promise((resolve, reject) => {
        axios.get('v1/aws/sts/s3').then((response) => {
            const s3 = new AWS.S3({
                accessKeyId: response.data.access_key,
                secretAccessKey: response.data.secret_access_key,
                sessionToken: response.data.session_token,
                region: response.data.region,
            })
            const uploadPromises = files.map((file) => {
                return new Promise((resolveUpload, rejectUpload) => {
                    const upload = new AWS.S3.ManagedUpload({
                        params: {
                            Bucket: response.data.bucket,
                            Key: `task/${taskId}/source/original_v${fileVersion}.${fileExtension(file.name)}`,
                            Body: file,
                        },
                        service: s3,
                    });
                    setUploadProgress && upload.on('httpUploadProgress', progress => setUploadProgress((progress.loaded / progress.total * 100).toFixed()))
                    upload.promise().then((response) => {
                        console.log(response);
                        resolveUpload(response);
                    }).catch((reason) => {
                        console.log(reason);
                        rejectUpload(reason);
                    });
                });
            });
            Promise.all(uploadPromises).then(() => {
                resolve("All uploads completed successfully.");
            }).catch((reason) => {
                reject(reason);
            });
        })
    })
}
