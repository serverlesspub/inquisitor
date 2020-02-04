---

---


Region: <input name="region" readonly="true" disabled="true" value="{{site.Region}}" />

Cognito Identity Pool: <input name="cognitoIdentityPool" disabled="true" readonly="true" value="{{site.IdentityPool}}"/>

API Key ID: <input name="apiKey" readonly="true" disabled="true" value="{{site.ApiKey}}" />

Number of requests: <input type="number" name="requestCount" value="100"/>

Batch size: <input type="number" name="batchSize" value="100"/>

<button test-type="api" target="{{site.RegionalApiUrl}}" label="regional-api" >Regional API + Lambda</button>
<button test-type="api" target="{{site.EdgeApiUrl}}" label="edge-api" >Edge API + Lambda</button>
<button test-type="lambda" target="{{site.SyncTestFunction}}" label="lambda" >Lambda</button>
<button test-type="apikey" target="{{site.RegionalKeyApiUrl}}" label="regional-api-key" >Regional API + API Key + Lambda</button>

<div role="reporter">
</div>

<script type="module" src="main.js"></script>
<script src="vendor/aws-sdk.min.js"></script>

