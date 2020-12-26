import { TileMap } from './tileMap/TileMap';
import { Viewport } from './viewport/Viewport';

const viewportA = new Viewport;
// const viewportB = new Viewport;

document.addEventListener('DOMContentLoaded', function() {
	viewportA.render(document.body);
	// viewportB.render(document.body);

	Promise.all([viewportA.tileMap.ready]).then(()=>{

		const update = ()=>{
			viewportA.update();
			// viewportB.update();
			requestAnimationFrame(update);
		};

		update();

	});
});
