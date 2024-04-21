import axios from "../axios";
import AWS from "aws-sdk"
import {fileExtension} from "../functions";
import {getSts} from "./sts";
import {lambdaRequest} from "./lambda";

const s3Uploader = async (fileName, file, sts) => {
    try {
        const s3 = new AWS.S3({
            accessKeyId: sts.accessKeyId,
            secretAccessKey: sts.secretAccessKey,
            sessionToken: sts.sessionToken,
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
    return new Promise(async (resolve, reject) => {
        const sts = await getSts()
        const uploadPromises = files.map((file) => {
            return new Promise(async (resolveUpload, rejectUpload) => {
                const extension = fileExtension(file.name)
                const uploader = await s3Uploader(`task/${taskId}/source/original_v${fileVersion}.${extension}`, file, sts)
                uploader.on('httpUploadProgress', progress => setUploadProgress(`${(progress.loaded / progress.total * 100).toFixed()} %`))
                uploader.promise().then(async (response) => {
                    if (extension === 'mp4') {
                        setUploadProgress('웨이브폼 생성중...')
                        await lambdaRequest('subtitleqc-extract-audio', {
                            bucket: response.Bucket,
                            key: response.Key
                        }, sts)
                        await lambdaRequest('subtitleqc-generate-waveform', {
                            bucket: response.Bucket,
                            key: response.Key.replace(`.${extension}`, '.wav')
                        }, sts)
                    }
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
        const sts = await getSts()
        const uploader = await s3Uploader(`task/${taskId}/works/${workId}/${fileName}.fspx`, file, sts)
        uploader.promise().then(() => console.log('upload completed'))
    } catch (e) {
        console.log(e)
    }
}
