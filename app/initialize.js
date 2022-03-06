import { Bgm } from './audio/Bgm';
import { Sfx } from './audio/Sfx';
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

/*** BGM ***/

Bgm.register('STAR_SHIELD', '/audio/leslie-wai/feel-the-sunshine.mp3');
Bgm.register('RADICAL_CITY', '/audio/colbreakz/848482_ColBreakz---My-Universe.mp3');
Bgm.register('WEST_SIDE', '/audio/akselmcbossmcgee123/1066486_Blammed-By-Pico.mp3');
Bgm.register('UNDERGROUND_ZONE', '/audio/tee-lopes/under-ground-zone-remix.mp3');
Bgm.register('MISTY_RUINS', 'audio/neil-voss/extol.mp3');

Bgm.register('TITLE_THEME', '/Sonic/carnival-night-zone-act-2-beta.mp3');
Bgm.register('MENU_THEME', '/Sonic/s3k-competition.mp3');
Bgm.register('TUTORIAL_THEME', '/audio/teravex/1083419_Lowbeat.mp3');

Bgm.register('ACT-BOSS', '/audio/F-777/Double-Cross.mp3');
Bgm.register('ZONE-BOSS', '/audio/dex-arson/rampage.mp3');

/*** SFX ***/

Sfx.register('PLAYER_DAMAGED', '/Sonic/S3K_35.wav');
Sfx.register('RINGS_SCATTERED', '/Sonic/ring-loss.wav', {maxConcurrent: 3, volume: 0.75, fudgeFactor: 0});
Sfx.register('BUMPER_BOUNCE', '/Sonic/S3K_AA.wav');

Sfx.register('RING_COLLECTED', '/Sonic/ring-collect.wav', {maxConcurrent: 3, volume: 0.25, fudgeFactor: 0.1});
Sfx.register('EMERALD_COLLECTED', '/Sonic/S3K_9C.wav');

Sfx.register('OBJECT_DESTROYED',  '/Sonic/object-destroyed.wav', {maxConcurrent: 3, volume: 0.75, fudgeFactor: 0.1});
Sfx.register('BLOCK_DESTROYED',  '/Sonic/0A3H.wav', {maxConcurrent: 8, volume: 1, fudgeFactor: 0, startTime: 0.4});
Sfx.register('ROCKS_DESTROYED',  '/Sonic/rock-smash.wav');

Sfx.register('SPEEDPAD_HIT', '/Sonic/S2_2B.wav', {maxConcurrent: 3, volume: 0.75, fudgeFactor: 0.1});
Sfx.register('SPRING_HIT', '/Sonic/spring-activated.wav', {maxConcurrent: 2, volume: 0.5, fudgeFactor: 0.1});
Sfx.register('SWITCH_HIT', '/Sonic/switch-activated.wav');

Sfx.register('STARPOST_HIT', '/Sonic/starpost-active.wav', {volume: 0.5});

Sfx.register('SHOT_FIRED', '/Sonic/shot-fired.wav', {volume: 0.5});
Sfx.register('THRUSTER_FIRED', '/Sonic/mecha-sonic-thruster.wav');

Sfx.register('BOSS_DAMAGED', '/Sonic/S3K_6E.wav');
Sfx.register('BOSS_DUDHIT',  '/Sonic/S2_59.wav');

Sfx.register('WATER_ACQUIRE', '/Sonic/S3K_3F.wav', {volume: 0.75, fudgeFactor: 0.1});
Sfx.register('WATER_BOUNCE', '/Sonic/S3K_44.wav', {volume: 0.5, fudgeFactor: 0.1});

Sfx.register('ELECTRIC_ACQUIRE', '/Sonic/S3K_41.wav', {volume: 0.75, fudgeFactor: 0.1});
Sfx.register('ELECTRIC_JUMP', '/Sonic/S3K_45.wav', {maxConcurrent: 3, volume: 0.5, fudgeFactor: 0.1});

Sfx.register('FIRE_ACQUIRE', '/Sonic/S3K_3E.wav', {volume: 0.75, fudgeFactor: 0.1});
Sfx.register('FIRE_DASH', '/Sonic/S3K_43.wav', {volume: 0.5, fudgeFactor: 0.1});

Sfx.register('CHOPPER_DRONE', '/Sonic/drill-car-copter.wav');
Sfx.register('CHOPPER_DRONE', '/Sonic/drill-car-copter.wav');

Sfx.register('MECHASONIC_TAKEOFF', '/Sonic/mecha-sonic-takeoff.wav');
Sfx.register('MECHASONIC_SCRAPE', '/Sonic/mecha-sonic-scrape.wav');
Sfx.register('MECHASONIC_SLAP', '/Sonic/mecha-sonic-thruster-close.wav');

Sfx.register('TAILS_FLY', '/Sonic/tails-flying.wav');

Sfx.register('LIGTNING_STRIKE', '/Sonic/S3K_4E.wav', {maxConcurrent: 1, volume: 1, fudgeFactor: 0})
