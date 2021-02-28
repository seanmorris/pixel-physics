import { Tag } from 'curvature/base/Tag';

import { TileMap } from './tileMap/TileMap';
import { Viewport } from './viewport/Viewport';

const viewportA = new Viewport;
// const viewportB = new Viewport;

document.addEventListener('DOMContentLoaded', function() {
	let lastTime = 0;

	const replayUrl = '/debug/replay-updated.json';

	const replay = fetch(replayUrl);

	Promise.all([viewportA.tileMap.ready, replay]).then(([tileMap,replayResult])=>{

		return replayResult.json()
	}).then (replay => {

		viewportA.replayInputs = replay;

		if(replay.length)
		{
			viewportA.args.hasRecording = true;
			// viewportA.args.isReplaying  = true;
		}

		viewportA.render(document.body);
		// viewportB.render(document.body);

		const body = new Tag(document.body);

		let skyShift = 100;

		const frameTimes = [];

		const update = ()=>{

			const now         = performance.now();
			const frameTime   = (now - lastTime);
			const frameAgeMin = (1000 / (viewportA.args.maxFps || 60));


			requestAnimationFrame(update);

			if(frameAgeMin > frameTime)
			{
				return;
			}

			lastTime = now;

			viewportA.update();

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
				// viewportA.args.fps = frameTimeAvg;
			}
			else
			{
				viewportA.args.fps = '...';
			}


			body.style({
				'background-position': `${(skyShift++ / 25)}px top,`
					+` -${(skyShift  / 23)}px 63%,`
					+` -${(skyShift  / 10)}px 63%,`
					+` ${(skyShift++ / 20)}px 63%,`
					+` -10% bottom`
			});

		};

		update();
	});
});
