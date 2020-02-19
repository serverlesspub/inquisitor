/*global AWS*/
export default async function executeLambda (lambdaName) {
	const params = {
			FunctionName: lambdaName,
			InvocationType: 'RequestResponse',
			Payload: '{}',
		},
		lambda = new AWS.Lambda(),
		result = await lambda.invoke(params).promise(),
		payload = JSON.parse(result.Payload),
		body = JSON.parse(payload.body);
	if (result.StatusCode === 200) {
		return body;
	} else {
		throw new Error(result);
	}
}
