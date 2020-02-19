import asyncIterator from './async-iterator.js';
import executeLambda from './execute-lambda.js';
import initCognito from './init-cognito.js';

const getParams = function ()  {
		const params = {},
			inputs = Array.from(document.querySelectorAll('input[name]'));
		inputs.forEach(input => (params[input.getAttribute('name')] = input.value));
		return params;
	},
	variableParamsSelector = 'input[name]:not([readonly])',
	readInputs = function () {
		const inputs = Array.from(document.querySelectorAll(variableParamsSelector));
		inputs.forEach(input => {
			const stored = localStorage[input.getAttribute('name')];
			if (stored) {
				input.value = stored;
			}
		});
	},
	saveInputs = function () {
		const inputs = Array.from(document.querySelectorAll(variableParamsSelector));
		inputs.forEach(input => {
			localStorage[input.getAttribute('name')] = input.value;
		});
	},
	testEngines = {
		api: (target, params, index) => fetch(`${target}?timestamp=${Date.now()}&index=${index}`, {mode: 'cors'}).then(response => response.json()),
		apiPost: (target) => fetch(target, {method: 'post', mode: 'cors'}).then(response => response.json()),
		apikey: (target, params) => fetch(target, {mode: 'cors', headers: {'x-api-key': params.apiKey}}).then(response => response.json()),
		lambda: executeLambda
	},
	safeParse = (param) => {
		if (!param) {
			return {};
		}
		if (typeof param === 'string') {
			return JSON.parse(param);
		}
		return param;
	},
	runOne = async function (index, testType, target, params) {
		try {
			const startTs = Date.now(),
				result = await testEngines[testType](target, params, index),
				timing = Date.now() - startTs,
				instance = safeParse(result).instance;
			return { timing, instance };
		} catch (e) {
			console.error(e);
			return false;
		}
	},
	intSort = function (a, b) {
		return parseInt(a) - parseInt(b);
	},
	runTest = async function (testType, target, params, reporter) {
		const requestCount = parseInt(params.requestCount),
			batchSize = parseInt(params.batchSize),
			requestArray = new Array(requestCount).fill(' ').map((v, k) => k),
			predicate = async index => {
				const result = await runOne (index, testType, target, params),
					display = (result && result.timing) ? `${result.timing}ms` : 'error';
				reporter(`${index} of ${requestCount} => ${display}`);
				return result;
			},
			results = await asyncIterator(requestArray, predicate, batchSize),
			successful = results.filter(i => i),
			successTimings = successful.map(s => s.timing).sort(intSort),
			instances = new Set(successful.map(s => s.instance)),
			total = successTimings.length && successTimings.reduce((a, c) => a + c);
		console.log('instances', instances);
		return {
			completed: successful.length,
			failed: requestCount - successful.length,
			average: total && total/successful.length,
			sixFive: successTimings[Math.floor(successful.length * 0.65)] || 0,
			nineFive: successTimings[Math.floor(successful.length * 0.95)] || 0,
			min: successTimings[0] || 0,
			instances: instances.size
		};
	},
	init = function () {
		const buttons = Array.from(document.querySelectorAll('button[test-type]')),
			reporter = document.querySelector('[role=reporter]');
		buttons.forEach(button => {
			button.addEventListener('click', async () => {
				saveInputs();
				const label = button.getAttribute('label'),
					result = await runTest(
						button.getAttribute('test-type'),
						button.getAttribute('target'),
						getParams(),
						message => reporter.innerHTML = message
					);
				console.log(label, JSON.stringify(result));
				reporter.innerHTML = `
					<h3>${label}</h3>
					completed: ${result.completed}<br/>
					failed: ${result.failed}<br/>
					average: ${result.average}ms<br/>
					65% ${result.min}ms - ${result.sixFive}ms<br/>
					95% ${result.min}ms - ${result.nineFive}ms<br/>
					used ${result.instances} distinct instances
				`;
			});
		});
		readInputs();
		initCognito(getParams());
	};

window.addEventListener('load', init);
