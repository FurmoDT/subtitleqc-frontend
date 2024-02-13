import AWS from "aws-sdk";

export const lambdaRequest = async (functionName, data, sts) => {
    const lambda = new AWS.Lambda({
        accessKeyId: sts.accessKeyId,
        secretAccessKey: sts.secretAccessKey,
        sessionToken: sts.sessionToken,
        region: sts.region,
    })
    await lambda.invoke({
        FunctionName: functionName,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(data)
    }).promise()
}
