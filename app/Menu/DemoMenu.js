import { ReplayDatabase } from '../replay/ReplayDatabase';
import { Replay } from '../replay/Replay';
import { Router } from 'curvature/base/Router';

const startDemo = (parent, menu, replay, offset = 0) => {
	parent.reset();
	parent.replayFrames   = replay.getIndexedFrames();
	parent.replayStart    = parent.replayFrames.get(offset || replay.firstFrame) || {};
	parent.replay         = replay;
	parent.maxReplayFrame = replay.lastFrame;
	parent.replayOffset   = -1 + replay.firstFrame + offset;

	Router.setQuery('demo', replay.uuid);

	parent.loadMap({mapUrl: replay.map}).then(() => {
		parent.args.paused    = true;
		parent.playback();
	});
}

const loadChildren = (parent, menu, offset = 0) => {
	return ReplayDatabase.open('replays', 3).then(database => {

		const store = 'replays';
		const limit = 10;
		const type  = Replay;
		const direction = 'prev';

		let index = 'id';
		let range = [];

		if(parent.baseMap)
		{
			index = 'map-id';
			range = [[parent.baseMap,0],[parent.baseMap,Infinity]];
		}

		const query = {store, index, direction, limit, offset, type, range};

		const children = {};

		if(!offset)
		{
			children['Import'] = {callback: () => {
				const fileInput = document.createElement('input');
				fileInput.setAttribute('type', 'file');
				fileInput.click();

				fileInput.addEventListener('change', event => {
					const files = event.target.files;
					for(const file of files) file.text().then(json => {
						const skel   = JSON.parse(json);
						delete skel.id;
						delete skel.uuid;
						const replay = Replay.from(skel);
						delete replay.id;
						database.insert('replays', replay);
					})
				}, {once:true});
			}};
		}

		return database.select(query).each(replay => {

			const duration = (replay.lastFrame - replay.firstFrame);

			// if(duration < 120)
			// {
			// 	database.delete('replays', replay);
			// }

			const min  = String(Math.trunc(duration / (60*60))).padStart(1, '0');
			const sec  = String(Math.trunc(duration / 60) % 60).padStart(2, '0');
			const durationLabel = `${min}:${sec}`;

			let childName = `${durationLabel}] ${new Date(replay.created).toLocaleString('en-US')}`;
			let subtext = replay.map;

			if(replay.name)
			{
				childName = durationLabel + '] ' + replay.name;
				subtext = new Date(replay.created).toLocaleString('en-US') + ' ' + replay.map;
			}

			children[ childName ] = {
				subtext,
				color: replay.color,
				children: {
					'Replay': { callback: () => startDemo(parent, menu, replay)},
					'Skip to': { children: () => {
						const subchildren = {};

						for(const offset of replay.keyFrames)
						{
							const min  = String(Math.trunc(offset / (60*60))).padStart(2, '0');
							const sec  = String(Math.trunc(offset/60) % 60).padStart(2, '0');
							const time = `${min}:${sec}`;

							subchildren[time] = { callback: () => startDemo(parent, menu, replay, offset) };
						}

						console.log(subchildren);

						return subchildren;
					}},
					'Options': { children: {

						Banners: {
							input: 'boolean'
							, revert: () => parent.args.replayBanners = true
							, set: value => parent.args.replayBanners = value
							, get: () => parent.args.replayBanners
						},

						'Quick Exit': {
							input: 'boolean'
							, revert: () => parent.args.replayQuickExit = false
							, set: value => parent.args.replayQuickExit = value
							, get: () => parent.args.replayQuickExit
						},

					}},

					'Export': { callback: () => {
						const fileContents = new Blob([JSON.stringify(replay)], {type: 'text/json'});
						const fileUrl  = URL.createObjectURL(fileContents);
						const fileLink = document.createElement('a');

						fileLink.href = fileUrl;
						fileLink.download = `${replay.name || replay.uuid}.json`;

						fileLink.click();
					}},
					'Rename': { children: {
						name: {
							input: 'string'
							, set: value => {
								replay.name = value;
								database.update('replays', replay);
							}
							, get: () => replay.name
						},
						color: {
							input: 'string'
							, set: value => {
								replay.color = value;
								database.update('replays', replay);
							}
							, get: () => replay.color
						}

					}},
					'Delete':{ children: {
						No: {callback:() => {
							menu.back(1);
						}},
						Yes: {callback:() => {
							delete children[ childName ];
							database.delete('replays', replay);
							// database.select({query, limit: 1, offset: -1 + limit + offset}).each(replay => {
							// 	children[ childName ];
							// });
							menu.back(2);
						}},
					}},
				}
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

export const DemoMenu = {
	subtext: 'View error log.'
	, children: loadChildren
};

