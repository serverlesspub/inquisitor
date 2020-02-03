---

---


# Test web page

Number of requests: <input type="number" name="requestCount" value="100"/><br/>

Batch size: <input type="number" name="batchSize" value="100"/><br/>

<button test-type="api" target="{{site.RegionalApiUrl}}regional" label="regional-api" >Regional API + Lambda</button>

<button test-type="api" target="{{site.EdgeApiUrl}}edge" label="edge-api" >Edge API + Lambda</button>

<script type="module" src="main.js"></script>
