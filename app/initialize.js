import { Bgm } from './audio/Bgm';
import { Sfx } from './audio/Sfx';
import { Viewport } from './viewport/Viewport';

import { Tag } from 'curvature/base/Tag';
import { TileMap } from './tileMap/TileMap';
import { Matrix } from 'matrix-api/Matrix'

if(location.pathname === '/accept-sso')
{
	const baseUrl = 'https://matrix.org/_matrix';
	const matrix  = new Matrix(baseUrl);

	// Get the loginToken from the query string.
	const query = new URLSearchParams(location.search);
	const token = query.get('loginToken');

	// Complete the SSO and close the window.
	matrix.completeSso(token);
}
else
{
	const viewportA = new Viewport;

	document.addEventListener('DOMContentLoaded', function() {

		console.log('Starting...');

		if(navigator.serviceWorker)
		{
			navigator.serviceWorker.register('/worker-cache.js');
		}

		let lastTime = 0;

		viewportA.render(document.body);

		const frameTimes = [];

		const update = ()=>{
			requestAnimationFrame(update);

			const now         = performance.now();
			const frameTime   = (now - lastTime);
			const frameAgeMin = (1000 / (viewportA.args.maxFps || 61));

			if(frameTime < frameAgeMin)
			{
				return;
			}

			viewportA.update();
			viewportA.args.fps = 1000 / frameTime;
			lastTime = now;
		};

		update();
	});

	/*** BGM ***/

	Bgm.register('STAR_SHIELD', '/audio/leslie-wai/feel-the-sunshine.mp3');
	Bgm.register('RADICAL_CITY', '/audio/colbreakz/848482_ColBreakz---My-Universe.mp3');
	Bgm.register('WEST_SIDE', '/audio/akselmcbossmcgee123/1066486_Blammed-By-Pico.mp3');
	Bgm.register('UNDERGROUND_ZONE', '/audio/tee-lopes/under-ground-zone-remix.mp3');
	Bgm.register('MISTY_RUINS', 'audio/neil-voss/extol.mp3');
	Bgm.register('MANIC_HARBOR', '/audio/bobenshibobsled/1024371_Curse-Ska-Version.mp3');

	Bgm.register('TITLE_THEME', '/Sonic/carnival-night-zone-act-2-beta.mp3');
	Bgm.register('MENU_THEME', '/Sonic/s3k-competition.mp3');
	Bgm.register('TUTORIAL_THEME', '/audio/teravex/1083419_Lowbeat.mp3');

	Bgm.register('ACT-BOSS', '/audio/F-777/Double-Cross.mp3');
	Bgm.register('ZONE-BOSS', '/audio/dex-arson/rampage.mp3');

	Bgm.register('NO_WAY', '/audio/sonic/no-way.mp3');

	/*** SFX ***/

	Sfx.register('PLAYER_DAMAGED', '/Sonic/S3K_35.wav');
	Sfx.register('RINGS_SCATTERED', '/Sonic/ring-loss.wav', {maxConcurrent: 3, volume: 0.75, fudgeFactor: 0});
	Sfx.register('BUMPER_BOUNCE', '/Sonic/S3K_AA.wav');
	Sfx.register('BOOST_RING', '/Sonic/S3K_CA.wav', {maxConcurrent: 1, volume: 0.75, fudgeFactor: 0.2});

	Sfx.register('RING_COLLECTED', '/Sonic/ring-collect.wav', {maxConcurrent: 3, volume: 0.25, fudgeFactor: 0.1});
	Sfx.register('SPIKE_DAMAGE', '/Sonic/S2_26.wav', {maxConcurrent: 1, volume: 0.5, fudgeFactor: 0.1});
	Sfx.register('EMBLEM_COLLECTED', '/custom/emblem-collect.wav', {maxConcurrent: 3, volume: 0.25, fudgeFactor: 0.1});
	Sfx.register('EMERALD_COLLECTED', '/Sonic/S3K_9C.wav');

	Sfx.register('OBJECT_DESTROYED',  '/Sonic/object-destroyed.wav', {maxConcurrent: 3, volume: 0.75, fudgeFactor: 0.1});
	Sfx.register('BLOCK_DESTROYED',  '/Sonic/0A3H.wav', {maxConcurrent: 4, volume: 1, fudgeFactor: 0, startTime: 0.4});

	Sfx.register('ROCKS_DESTROYED',  '/Sonic/rock-smash.wav');

	Sfx.register('ROCK_BREAK_1',  '/Sonic/S1_B9.wav', {maxConcurrent: 1, volume: 0.25, fudgeFactor: 0.3});
	Sfx.register('ROCK_BREAK_2',  '/Sonic/S1_CB.wav', {maxConcurrent: 1, volume: 0.50, fudgeFactor: 0.1});

	Sfx.register('SPEEDPAD_HIT', '/Sonic/S2_2B.wav', {maxConcurrent: 3, volume: 0.75, fudgeFactor: 0.1});
	Sfx.register('HALLBOOSTER_HIT', '/Sonic/S3K_74.wav', {maxConcurrent: 1, volume: 0.75, fudgeFactor: 0.1});
	Sfx.register('SPRING_HIT', '/Sonic/spring-activated.wav', {maxConcurrent: 2, volume: 0.5, fudgeFactor: 0.1});
	Sfx.register('SWITCH_HIT', '/Sonic/switch-activated.wav', {maxConcurrent: 3, volume: 0.3, fudgeFactor: 0.2});

	Sfx.register('ALT_BEEP', '/Sonic/S2_28.wav', {maxConcurrent: 8, volume: 0.5, fudgeFactor: 0.2});
	Sfx.register('KNOCK_PLATFORM', '/Sonic/S2_57.wav', {maxConcurrent: 3, volume: 0.8, fudgeFactor: 0.2});
	Sfx.register('STAR_TWINKLE', '/Sonic/S2_27.wav', {maxConcurrent: 3, volume: 0.8, fudgeFactor: 0.2});
	Sfx.register('PAD_BOUNCE', '/Sonic/S2_58.wav', {maxConcurrent: 3, volume: 0.8, fudgeFactor: 0.2});

	Sfx.register('SS_BWIP', '/Sonic/S1_A9.wav', {maxConcurrent: 8, volume: 0.85, fudgeFactor: 0.2});
	Sfx.register('SS_BWIP_HIGH', '/Sonic/S2_29.wav', {maxConcurrent: 8, volume: 0.85, fudgeFactor: 0.2});

	Sfx.register('WAIT_TONE', '/Sonic/S3K_A7.wav', {maxConcurrent: 8, volume: 0.5, fudgeFactor: 0.2});
	Sfx.register('READY_TONE', '/Sonic/S3K_AD.wav', {maxConcurrent: 8, volume: 0.5, fudgeFactor: 0.2});

	Sfx.register('STARPOST_HIT', '/Sonic/starpost-active.wav', {volume: 0.5});

	Sfx.register('SHOT_FIRED', '/Sonic/shot-fired.wav', {volume: 0.5});
	Sfx.register('THRUSTER_FIRED', '/Sonic/mecha-sonic-thruster.wav');

	Sfx.register('BOSS_DAMAGED', '/Sonic/S3K_6E.wav');
	Sfx.register('BOSS_DUDHIT',  '/Sonic/S2_59.wav');

	Sfx.register('FAIL', '/Sonic/S2_6D.wav');

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
	Sfx.register('SECRET_FOUND', '/doom/dssecret.wav');

	Sfx.register('GRINDING', '/Sonic/S3K_DB_sus.wav');
	Sfx.register('SPIKES_OUT', '/Sonic/S3K_A6.wav');
	Sfx.register('SPIKES_IN', '/Sonic/S3K_52.wav');
	Sfx.register('LID_POP', '/Sonic/S2_54.wav', {maxConcurrent: 1, volume: 0.5, fudgeFactor: 0.25});

	Sfx.register('POGO_BOUNCE', '/Sonic/0A8H.wav', {maxConcurrent: 3, volume: 0.5, fudgeFactor: 0.25});
}

