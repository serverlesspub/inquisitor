import asyncIterator from './async-iterator.js';

const getParams = function ()  {
		const params = {},
			inputs = Array.from(document.querySelectorAll('input[name]'));
		inputs.forEach(input => (params[input.getAttribute('name')] = input.value));
		return params;
	},
	readInputs = function () {
		const inputs = Array.from(document.querySelectorAll('input[name]'));
		inputs.forEach(input => {
			const stored = localStorage[input.getAttribute('name')];
			if (stored) {
				input.value = stored;
			}
		});
	},
	saveInputs = function () {
		const inputs = Array.from(document.querySelectorAll('input[name]'));
		inputs.forEach(input => {
			localStorage[input.getAttribute('name')] = input.value;
		});
	},
	testEngines = {
		api: (target) => fetch(target, {mode: 'cors'})
	},
	runOne = async function (index, testType, target) {
		try {
			const startTs = Date.now(),
				result = await testEngines[testType](target),
				endTs = Date.now();
			return endTs - startTs;
		} catch (e) {
			return 0;
		}
	},
	runTest = async function (testType, target, params, reporter) {
		const requestCount = parseInt(params.requestCount),
			batchSize = parseInt(params.batchSize),
			requestArray = new Array(requestCount).fill(' ').map((v, k) => k),
			predicate =  index => {
				reporter(`${index} of  ${requestCount}`);
				return runOne (index, testType, target);
			},
			results = await asyncIterator(requestArray, predicate, batchSize),
			successful = results.filter(i => i).sort(),
			total = successful.length && successful.reduce((a, c) => a + c);
		return {
			completed: successful.length,
			failed: requestCount - successful.length,
			average: total && total/successful.length,
			sixFive: successful[Math.floor(successful.length * 0.65)],
			nineFive: successful[Math.floor(successful.length * 0.95)],
			min: successful[0]
		}
	},
	init = function () {
		console.log('init');
		const buttons = Array.from(document.querySelectorAll('button[test-type]')),
			reporter = document.querySelector('[role=reporter]');
		buttons.forEach(button => {
			button.addEventListener('click', async () => {
				const label = button.getAttribute('label'),
					result = await runTest(
						button.getAttribute('test-type'),
						button.getAttribute('target'),
						getParams(),
						message => reporter.innerHTML = message
					);
				saveInputs();
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
	};

window.addEventListener('load', init);
