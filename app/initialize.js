import { Bgm } from './audio/Bgm';
import { Viewport } from './viewport/Viewport';

import { Tag } from 'curvature/base/Tag';
import { TileMap } from './tileMap/TileMap';

const viewportA = new Viewport;

document.addEventListener('DOMContentLoaded', function() {

	console.log('Starting...');

	// setTimeout(()=>console.log(window.myfunc(512, 512)), 1500);

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

		if(frameTimes.length > 1)
		{
			const frameTimeSum = frameTimes.reduce((a,b)=>a+b);
			const frameTimeAvg = frameTimeSum / frameTimes.length;

			viewportA.args.fps = 1000 / frameTimeAvg;

			frameTimes.splice(0);
		}
	};

	update();
});

Bgm.register('STAR_SHIELD', '/audio/leslie-wai/feel-the-sunshine.mp3', 1);
Bgm.register('RADICAL_CITY', '/audio/colbreakz/848482_ColBreakz---My-Universe.mp3', 1);
Bgm.register('WEST_SIDE', '/audio/akselmcbossmcgee123/1066486_Blammed-By-Pico.mp3', 1);
Bgm.register('UNDERGROUND_ZONE', '/audio/tee-lopes/under-ground-zone-remix.mp3', 1);
Bgm.register('MISTY_RUINS', 'audio/neil-voss/extol.mp3', 1);

Bgm.register('TITLE_THEME', '/Sonic/carnival-night-zone-act-2-beta.mp3', 1);
Bgm.register('MENU_THEME', '/Sonic/s3k-competition.mp3', 1);
Bgm.register('TUTORIAL_THEME', '/audio/teravex/1083419_Lowbeat.mp3', 1);

Bgm.register('ACT-BOSS', '/audio/F-777/Double-Cross.mp3', 1);
Bgm.register('ZONE-BOSS', '/audio/dex-arson/rampage.mp3', 1);

// Bgm.play('RADICAL_CITY');
