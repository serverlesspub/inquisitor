/*global AWS*/
export default function initCognito (params) {
	const {region, cognitoIdentityPool} = params,
		creds = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: cognitoIdentityPool
		});

	AWS.config.update({
		region: region,
		credentials: creds
	});
}

