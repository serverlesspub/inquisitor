/*global exports*/
exports.handler = async function (request, context) {
	const content = Object.assign({
		ts: Date.now(),
		instance: context.logStreamName
	}, request.queryStringParameters);
	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify(content)
	};
};
