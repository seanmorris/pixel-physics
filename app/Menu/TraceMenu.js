import { TraceDatabase } from '../trace/TraceDatabase';

const loadChildren = (parent, offset = 0) => {
	return TraceDatabase.open('traces', 1).then(database => {

		const store = 'traces';
		const index = 'id';
		const limit = 10;
		const direction = 'prev';

		const query = {store, index, direction, limit, offset};

		const children = {};

		return database
		.select(query)
		.each(trace => {
			children[ `${trace.id})${new Date(trace.created).toLocaleString('en-US')}` ] = {
				subtext: trace.message,
				callback: () => {

					// const shiftedDate = new Date(trace.created);
					const traceWin = window.open();

					traceWin.document.write(
						`${trace.uuid}\n`
						+ `${trace.message}\n${trace.local}\n`
						+ `${trace.buildTime}\n`
						+ `${trace.created}\n\n`
						+ `${trace.stack}\n`
					);

					traceWin.document.body.style.whiteSpace = 'pre';
					traceWin.document.body.style.fontFamily = 'monospace';
				}
			};
		})
		.then(results => {
			if(results.mapped)
			{
				children['Next ' + limit] = { children: loadChildren(parent, offset+limit) };
			}
			return children;
		});
	});
};

export const TraceMenu = {
	subtext: 'View error log.'
	, children: loadChildren
};

