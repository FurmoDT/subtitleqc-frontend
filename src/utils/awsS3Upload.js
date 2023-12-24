import axios from "./axios";
import AWS from "aws-sdk"
import {fileExtension} from "./functions";

const s3Uploader = async (fileName, file) => {
    try {
        const sts = (await axios.get('v1/aws/sts/s3')).data
        const s3 = new AWS.S3({
            accessKeyId: sts.access_key,
            secretAccessKey: sts.secret_access_key,
            sessionToken: sts.session_token,
            region: sts.region,
        })
        const upload = new AWS.S3.ManagedUpload({
            params: {Bucket: sts.bucket, Key: fileName, Body: file}, service: s3,
        })
        await upload
        return upload
    } catch (e) {
        console.log('upload error')
    }
}

export const s3UploadSource = (taskId, fileVersion, files, setUploadProgress) => {
    return new Promise((resolve, reject) => {
        const uploadPromises = files.map((file) => {
            return new Promise(async (resolveUpload, rejectUpload) => {
                const uploader = await s3Uploader(`task/${taskId}/source/original_v${fileVersion}.${fileExtension(file.name)}`, file)
                uploader.on('httpUploadProgress', progress => setUploadProgress((progress.loaded / progress.total * 100).toFixed()))
                uploader.promise().then((response) => {
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
}


export const s3UploadWork = async (taskHashedId, workHashedId, fileName, file) => {
    try {
        const taskId = (await axios.get(`v1/tasks/decode/${taskHashedId}`)).data
        const workId = (await axios.get(`v1/works/decode/${workHashedId}`)).data
        const uploader = await s3Uploader(`task/${taskId}/works/${workId}/${fileName}.fspx`, file)
        uploader.promise().then(() => console.log('upload completed'))
    } catch (e) {
        console.log(e)
    }
}
