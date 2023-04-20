import { TraceDatabase } from '../trace/TraceDatabase';

export const TraceMenu = (parent) => {

	console.trace(parent);

	const children = {};

	TraceDatabase.open('traces', 1).then(database => {

		const store = 'traces';
		const index = 'id';
		const direction = 'prev';

		const query = {store, index, direction};

		database
		.select(query)
		.each(trace => {

			children[ `${trace.id} ${trace.local}` ] = {
				subtext: trace.message,
				callback: () => {

					// const shiftedDate = new Date(trace.created);
					const traceWin = window.open();

					traceWin.document.write(
						`${trace.uuid}\n`
						+ `${trace.message}\n${trace.local}\n`
						+ `${trace.created}\n\n`
						+ `${trace.stack}\n`
					);

					traceWin.document.body.style.whiteSpace = 'pre';
					traceWin.document.body.style.fontFamily = 'monospace';
				}
			};

		})
		// .then(results => console.log(results))
	});

	return {children};

};

