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
				console.log('loaded', input.getAttribute('name'), input.value);
			}
		});
	},
	saveInputs = function () {
		const inputs = Array.from(document.querySelectorAll(variableParamsSelector));
		inputs.forEach(input => {
			console.log('saving', input.getAttribute('name'), input.value);
			localStorage[input.getAttribute('name')] = input.value;
		});
	},
	testEngines = {
		api: (target) => fetch(target, {mode: 'cors'}),
		lambda: executeLambda
	},
	runOne = async function (index, testType, target) {
		try {
			const startTs = Date.now();
			await testEngines[testType](target);
			return Date.now() - startTs;
		} catch (e) {
			console.error(e);
			return 0;
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
				const result = await runOne (index, testType, target);
				reporter(`${index} of ${requestCount} => ${result}ms`);
				return result;
			},
			results = await asyncIterator(requestArray, predicate, batchSize),
			successful = results.filter(i => i).sort(intSort),
			total = successful.length && successful.reduce((a, c) => a + c);
		return {
			completed: successful.length,
			failed: requestCount - successful.length,
			average: total && total/successful.length,
			sixFive: successful[Math.floor(successful.length * 0.65)],
			nineFive: successful[Math.floor(successful.length * 0.95)],
			min: successful[0]
		};
	},
	init = function () {
		console.log('init');
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
				`;
			});
		});
		readInputs();
		initCognito(getParams());
	};

window.addEventListener('load', init);
