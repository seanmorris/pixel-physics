import { Tag } from 'curvature/base/Tag';

import { TileMap } from './tileMap/TileMap';
import { Viewport } from './viewport/Viewport';

const viewportA = new Viewport;
// const viewportB = new Viewport;

document.addEventListener('DOMContentLoaded', function() {
	let lastTime = Date.now();

	Promise.all([viewportA.tileMap.ready]).then(()=>{

		viewportA.render(document.body);
		// viewportB.render(document.body);

		const body = new Tag(document.body);

		let skyShift = 100;

		setInterval( ()=> body.style({
			'background-position': `${(skyShift++ / 25)}px top,`
				+` -${(skyShift  / 23)}px 63%,`
				+` -${(skyShift  / 10)}px 63%,`
				+` ${(skyShift++ / 20)}px 63%,`
				+` -10% bottom`
		}) , 9);

		viewportA.update();

		const frameTimes = [];

		const update = ()=>{

			viewportA.update();

			const frameTime = (Date.now() - lastTime);

			frameTimes.push(frameTime);

			if(frameTimes.length > 10)
			{
				frameTimes.shift();
			}

			if(frameTimes.length > 1)
			{
				const frameTimeSum = frameTimes.reduce((a,b)=>a+b);
				const frameTimeAvg = frameTimeSum / frameTimes.length;

				viewportA.args.fps = 1000 / frameTimeAvg;
			}
			else
			{
				viewportA.args.fps = '...';
			}


			lastTime = Date.now();

			requestAnimationFrame(update);
		};

		update();
	});
});
