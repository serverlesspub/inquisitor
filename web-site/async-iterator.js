export default function asyncIterator (items, asyncProcessor, batchSize = 1) {
	let remaining = items || [];
	if (!Array.isArray(remaining)) {
		throw new Error('invalid-args');
	}
	if (typeof asyncProcessor !== 'function') {
		throw new Error('invalid-args');
	}
	const results = [],
		processNext = function (next) {
			return Promise.all(next.map(asyncProcessor))
				.then(nextResults => results.push.apply(results, nextResults))
				.then(processNextOrResolve); //eslint-disable-line no-use-before-define
		},
		processNextOrResolve = function () {
			let next;
			if (remaining.length) {
				next = remaining.slice(0, batchSize);
				remaining = remaining.slice(batchSize);
				return processNext(next);
			}
			return Promise.resolve(results);
		};
	return processNextOrResolve();
}
