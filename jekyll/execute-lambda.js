/*global AWS*/
export default async function executeLambda (lambdaName) {
	const params = {
			FunctionName: lambdaName,
			InvocationType: 'RequestResponse',
			Payload: '{}',
		},
		lambda = new AWS.Lambda(),
		result = await lambda.invoke(params).promise();
	/*,
		payload = JSON.parse(result.Payload),
		body = JSON.parse(payload.body);
	console.log(body);
	return body;*/
	if (result.StatusCode === 200) {
		return result;
	} else {
		throw new Error(result);
	}
}
