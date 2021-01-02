import { Tag } from 'curvature/base/Tag';

import { TileMap } from './tileMap/TileMap';
import { Viewport } from './viewport/Viewport';

const viewportA = new Viewport;
// const viewportB = new Viewport;

const minFrameTime = 0;

document.addEventListener('DOMContentLoaded', function() {
	viewportA.render(document.body);
	// viewportB.render(document.body);

	let lastTime = Date.now();

	Promise.all([viewportA.tileMap.ready]).then(()=>{

		const body = new Tag(document.body);

		let skyShift = 100;

		// setInterval( ()=> body.style({
		// 	'background-position': `${(skyShift++ / 25)}px top, -${(skyShift++ / 10)}px 63%, -10% bottom`
		// }) , 45);

		viewportA.update();

		const update = ()=>{
			if(Date.now() - lastTime >= minFrameTime)
			{
				viewportA.update();
				lastTime = Date.now();
			}
			// viewportB.update();
			requestAnimationFrame(update);
		};

		update();

	});
});
