import { Viewport } from './viewport/Viewport';

import { Tag } from 'curvature/base/Tag';
import { TileMap } from './tileMap/TileMap';

const viewportA = new Viewport;

document.addEventListener('DOMContentLoaded', function() {

	if(navigator.serviceWorker)
	{
		navigator.serviceWorker.register('/worker-cache.js');
	}

	let lastTime = 0;

	viewportA.render(document.body);

	viewportA.args.fps = '...';

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

		if(frameTimes.length > 3)
		{
			const frameTimeSum = frameTimes.reduce((a,b)=>a+b);
			const frameTimeAvg = frameTimeSum / frameTimes.length;

			viewportA.args.fps = 1000 / frameTimeAvg;

			frameTimes.splice(0);
		}
	};

	update();
});
