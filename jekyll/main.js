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
	runOne = async function (index, label, testType, target) {
		if (index % 100 === 0) {
			console.log(index, label, testType, target);
		}
		try {
			const startTs = Date.now(),
				result = await fetch(target, {mode: 'cors'}),
				endTs = Date.now();
			return endTs - startTs;
		} catch (e) {
			return 0;
		}
	},
	runTest = async function (label, testType, target, params) {
		saveInputs();
		console.log(label, testType, target, params);
		const requestCount = parseInt(params.requestCount),
			batchSize = parseInt(params.batchSize),
			requestArray = new Array(requestCount).fill(' ').map((v, k) => k),
			results = await asyncIterator(requestArray, idx => runOne (idx, label, testType, target), batchSize),
			successful = results.filter(i => i).sort(),
			total = successful.length && successful.reduce((a, c) => a + c),
			average = total && total/successful.length,
			sixFive = successful[Math.floor(successful.length * 0.65)],
			nineFive = successful[Math.floor(successful.length * 0.95)];
		console.log(label,
			'completed', successful.length,
			'failed', requestCount - successful.length,
			'average', average, 'ms',
			'65% <', sixFive, 'ms',
			'95% <', nineFive, 'ms');
	},
	init = function () {
		console.log('init');
		const buttons = Array.from(document.querySelectorAll('button[test-type]'));
		buttons.forEach(button => {
			button.addEventListener('click', () => runTest(
				button.getAttribute('label'),
				button.getAttribute('test-type'),
				button.getAttribute('target'),
				getParams()
			));
		});
		readInputs();
	};

window.addEventListener('load', init);
