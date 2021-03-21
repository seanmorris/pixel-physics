import { Tag } from 'curvature/base/Tag';

import { TileMap } from './tileMap/TileMap';
import { Viewport } from './viewport/Viewport';

const viewportA = new Viewport;

document.addEventListener('DOMContentLoaded', function() {

	if(navigator.serviceWorker)
	{
		navigator.serviceWorker.register('/worker-cache.js');
	}

	let lastTime = 0;

	// const replayUrl = '/debug/replay-updated.json';
	// const replay = fetch(replayUrl);

	Promise.all([viewportA.tileMap.ready]).then(([tileMap,replayResult])=>{

		viewportA.startLevel();

	}).then (replay => {

		viewportA.replayInputs = replay;

		if(replay && replay.length)
		{
			// viewportA.args.hasRecording = true;
			// viewportA.args.isReplaying  = true;
		}

		viewportA.render(document.body);

		const body = new Tag(document.body);

		let skyShift = 100;

		const frameTimes = [];

		const update = ()=>{

			const now         = performance.now();
			const frameTime   = (now - lastTime);
			const frameAgeMin = (1000 / (viewportA.args.maxFps || 60));

			requestAnimationFrame(update);

			if(viewportA.args.maxFps < 60 && frameAgeMin > frameTime)
			{
				return;
			}

			viewportA.update();

			lastTime = now;

			frameTimes.push(frameTime);

			if(frameTimes.length > 5)
			{
				frameTimes.shift();
			}

			if(frameTimes.length > 1)
			{
				const frameTimeSum = frameTimes.reduce((a,b)=>a+b);
				const frameTimeAvg = frameTimeSum / frameTimes.length;

				viewportA.args.fps = (1000 / frameTimeAvg);
			}
			else
			{
				viewportA.args.fps = '...';
			}
		};

		update();
	});
});
