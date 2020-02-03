---

---


# Test for {{site.Region}}

Number of requests: <input type="number" name="requestCount" value="100"/><br/>
Batch size: <input type="number" name="batchSize" value="100"/>

<button test-type="api" target="{{site.RegionalApiUrl}}" label="regional-api" >Regional API + Lambda</button>
<button test-type="api" target="{{site.EdgeApiUrl}}" label="edge-api" >Edge API + Lambda</button>

<div role="reporter">
</div>

<script type="module" src="main.js"></script>


