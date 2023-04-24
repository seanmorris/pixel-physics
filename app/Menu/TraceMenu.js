import { TraceDatabase } from '../trace/TraceDatabase';
import { ReplayDatabase } from '../replay/ReplayDatabase';
import { Replay } from '../replay/Replay';

const loadChildren = (parent, menu, offset = 0) => {
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

			const subchildren = {
				'Export Trace': { callback: () => {
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
				}},
				'Export Replay': { callback: () => {
					ReplayDatabase.open('replays', 3).then(database => {
						const store     = 'replays';
						const index     = 'uuid';
						const type      = Replay;
						const range     = trace.replay;

						const query = {store, index, offset, type, range};

						const children = {};

						database.select(query).one(replay => {
							const fileContents = new Blob([JSON.stringify(replay)], {type: 'text/json'});
							const fileUrl  = URL.createObjectURL(fileContents);
							const fileLink = document.createElement('a');

							fileLink.href = fileUrl;
							fileLink.download = `${replay.name || replay.uuid}.json`;

							fileLink.click();
						});
					});
				}}
			};

			if(parent.args.debugEnabled)
			{
				subchildren['View Replay'] = { callback: () => {
					ReplayDatabase.open('replays', 3).then(database => {
						const store     = 'replays';
						const index     = 'uuid';
						const type      = Replay;
						const range     = trace.replay;

						const query = {store, index, offset, type, range};

						const children = {};

						console.log(trace.replay);
						parent.replayStart = parent.replayFrames.get(replay.firstFrame);

						database.select(query).one(replay => {
							parent.loadMap({mapUrl: replay.map}).then(() => {
								parent.replay         = replay;
								parent.replayFrames   = replay.getIndexedFrames();
								parent.maxReplayFrame = replay.lastFrame;
								parent.args.paused  = -1;
								parent.args.frameId = -1;

								parent.args.started = false;
								parent.args.running = false;

								parent.playback();

								parent.replayOffset = -1 + replay.firstFrame;

								if(loaded)
								{
									menu.back();
								}
							});
						});
					});
				}};
			}

			children[ `${trace.id})${new Date(trace.created).toLocaleString('en-US')}` ] = {
				subtext: trace.message,
				children: subchildren
			};
		})
		.then(results => {
			if(results.mapped)
			{
				children['Next ' + limit] = { children: () => loadChildren(parent, menu, offset+limit) };
			}
			return children;
		});
	});
};

export const TraceMenu = {
	subtext: 'View error log.'
	, children: loadChildren
};

