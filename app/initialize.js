import { TileMap } from './tileMap/TileMap';
import { Viewport } from './viewport/Viewport';

const viewportA = new Viewport;
// const viewportB = new Viewport;

const minFrameTime = 1;

document.addEventListener('DOMContentLoaded', function() {
	viewportA.render(document.body);
	// viewportB.render(document.body);

	let lastTime = Date.now();

	Promise.all([viewportA.tileMap.ready]).then(()=>{

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
