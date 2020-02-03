exports.handler = async function (event, context) {
	const content = Object.assign({
			ts: Date.now(),
			instance: context.logStreamName
		}, event.queryStringParameters);
	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(content)
	};
};