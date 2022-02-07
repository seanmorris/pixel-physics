import { Bindable } from 'curvature/base/Bindable';
import { Bag  }     from 'curvature/base/Bag';
import { Tag  }     from 'curvature/base/Tag';
import { View }     from 'curvature/base/View';
import { Router }   from 'curvature/base/Router';
import { Keyboard } from 'curvature/input/Keyboard';
import { Sequence } from 'curvature/input/Sequence';

import { QuadCell } from '../QuadCell';

import { TileMap }  from '../tileMap/TileMap';

import { Titlecard } from '../titlecard/Titlecard';

import { Particle3d } from '../particle/Particle3d';

import { MarbleGarden as Backdrop } from '../backdrop/MarbleGarden';
import { ProtoLabrynth } from  '../backdrop/ProtoLabrynth';
import { MysticCave } from  '../backdrop/MysticCave';

import { Series }   from '../intro/Series';
import { Card }     from '../intro/Card';

import { TitleScreenCard } from '../intro/TitleScreenCard';
import { ThankYouCard } from    '../intro/ThankYouCard';
import { LoadingCard } from '../intro/LoadingCard';
import { BootCard } from    '../intro/BootCard';
import { DebianCard } from '../intro/DebianCard';
import { WebkitCard } from '../intro/WebkitCard';
import { GamepadCard } from '../intro/GamepadCard';
import { SeanCard } from    '../intro/SeanCard';

import { PauseMenu } from   '../Menu/PauseMenu.js';
import { MainMenu } from    '../Menu/MainMenu.js';

import { LayerSwitch } from '../actor/LayerSwitch';
import { Region } from '../region/Region';

import { CharacterString } from '../ui/CharacterString';
import { HudFrame } from '../ui/HudFrame';

import { Layer } from './Layer';

import { Controller } from '../controller/Controller';

import { BackdropPalette } from '../BackdropPalette';
import { ObjectPalette } from '../ObjectPalette';

import { ClickSwitch } from '../ui/ClickSwitch';

import { Console as Terminal } from 'subspace-console/Console';

import { Input as InputTask } from '../console/task/Input';
import { Impulse as ImpulseTask } from '../console/task/Impulse';
import { Settings as SettingsTask } from '../console/task/Settings';
import { Move as MoveTask } from '../console/task/Move';
import { Pos as PosTask } from '../console/task/Pos';
import { Spawn as SpawnTask } from '../console/task/Spawn';

// import { RtcClientTask } from '../network/RtcClientTask';
// import { RtcServerTask } from '../network/RtcServerTask';

import { RtcClient } from '../network/RtcClient';
import { RtcServer } from '../network/RtcServer';

import { Classifier } from '../Classifier';

import { ChatBox } from '../network/ChatBox';

import { Sonic } from '../actor/Sonic';
import { Tails } from '../actor/Tails';
import { Seymour } from '../actor/Seymour';
import { Chalmers } from '../actor/Chalmers';

const ActorPointCache = Symbol('actor-point-cache');
const ColCellNear = Symbol('collision-cells-near');
const ColCell = Symbol('collision-cells');
const Run = Symbol('run');

export class Viewport extends View
{
	secretSample = new Audio('/doom/dssecret.wav');
	secretsFound = new Set;
	template     = require('./viewport.html');

	constructor(args = {},parent)
	{
		args[ Bindable.NoGetters ] = true;

		super(args,parent);

		window.viewport = this;

		this[ Bindable.NoGetters ] = true;

		Router.listen(this, { '': () => '' });

		this.args.screenEffects = [];

		this.meta = {};

		this.objectPalette = ObjectPalette;

		// this.quadCell = null;

		this.callIntervals = new Map;
		this.callFrames    = new Map;
		this.willDetach    = new Map;
		this.backdrops     = new Map;
		this.checkpoints   = new Map;

		this.server = null;
		this.client = null;

		this.args.networked = false;

		this.args.mouse = 'moved';

		this.settings = Bindable.make({
			blur: true
			, displace: true
			, showHud: true
			, shortcuts: true
			, showFps: true
			, debugOsd: false
			, outline: 1
			, musicVol: 100
			, sfxVol: 100
			, username: 'player'
		});

		this.vizi = true;

		this.args.shakeX = 0;
		this.args.shakeY = 0;

		this.args.level = '';

		let mapUrl = '';

		const inputMapUrl = Router.query.map;

		let noMenu = false;

		if(inputMapUrl && inputMapUrl.match(/^\w/))
		{
			mapUrl = '/map/' + inputMapUrl;

			noMenu = true;
		}

		this.args.startFrameId = 0;
		this.args.lastFrameId  = -1;

		if(mapUrl)
		{
			this.loadMap({mapUrl});
		}

		this.sprites = new Bag;
		this.world   = null;

		// const ready = this.tileMap.ready;

		let noIntro = Router.query.nointro;

		const cards = [];

		if(noMenu)
		{
			noIntro = true;
		}

		if(!noIntro)
		{
			cards.push(...this.introCards());
		}
		else
		{
			cards.push(new MainMenu({timeout: -1}, this));
		}

		this.args.titlecard = new Series({cards}, this);

		if(!mapUrl)
		{
			this.args.titlecard.play();
		}

		this.args.noIntro = noIntro ? 'no-intro' : '';

		const debugKeys = [
			'ArrowUp'
			, 'ArrowUp'
			, 'ArrowDown'
			, 'ArrowDown'
			, 'ArrowUp'
			, 'ArrowUp'
			, 'ArrowUp'
			, 'ArrowUp'
		];

		const debugSeq = new Sequence({ keys: debugKeys, timing: 750 });

		const konamiKeys = [
			'ArrowUp'
			, 'ArrowUp'
			, 'ArrowDown'
			, 'ArrowDown'
			, 'ArrowLeft'
			, 'ArrowRight'
			, 'ArrowLeft'
			, 'ArrowRight'
			, 'KeyB'
			, 'KeyA'
			, 'Enter'
		];

		const konamiSeq = new Sequence({ keys: konamiKeys, timing: 750 });

		const gravityKeys = [
			'KeyS'
			, 'KeyV'
			, 'KeyG'
			, 'KeyR'
			, 'KeyA'
			, 'KeyV'
		];

		const gravitySeq = new Sequence({ keys: gravityKeys, timing: 750 });

		this.sequences = [debugSeq, konamiSeq, gravitySeq];

		this.args.debugEnabled  = false;
		this.args.debugEditMode = false;

		this.args.debugObjectCursor = 0;

		this.args.debugObjectName = new CharacterString({value:''});

		this.debugBank = {};

		debugSeq.addEventListener('complete', event => {

			if(this.args.debugEnabled)
			{
				return;
			}

			this.args.debugEnabled = true;

			console.log('Debug variable set.');

			this.args.topLine.args.value = ' Debug variable set! ';
			this.args.topLine.args.hide = '';

			this.onTimeout(1750, ()=>{
				this.args.topLine.args.value = '';
				this.args.status.args.hide = 'hide';
			});
		});

		konamiSeq.addEventListener('complete', event => {

			if(this.args.masterCheat)
			{
				return;
			}

			this.args.masterCheat = true;

			this.args.topLine.args.value = ' Master cheat detected. ';
			this.args.topLine.args.hide = '';

			console.log('Master cheat detected.');

			this.onTimeout(1750, ()=>{
				this.args.topLine.args.value = '';
				this.args.status.args.hide = 'hide';
			});
		});

		gravitySeq.addEventListener('complete', event => {


			if(!this.controlActor)
			{
				return;
			}

			this.controlActor.gravityCheat = !this.controlActor.gravityCheat;

			this.args.topLine.args.value = ` Gravity cheat ${this.controlActor.gravityCheat?'on':'off'}. `;
			this.args.topLine.args.hide = '';

			this.onTimeout(1750, ()=>{
				this.args.topLine.args.value = '';
				this.args.status.args.hide = 'hide';
			});

			if(this.controlActor.gravityCheat)
			{
				this.controlActor.args.gravity *= 0.5;
			}
			else
			{
				this.controlActor.args.gravity *= 2;
			}

		});

		console.log(this.debugSequence);

		this.args.pauseMenu = new PauseMenu({}, this);

		this.particleObserver = new IntersectionObserver((entries, observer) => {
			for(const entry of entries)
			{
				if(entry.intersectionRation === 0)
				{
					entry.target.style.display = 'none';

					entry.target.remove();
				}
				else
				{
					delete entry.target.style.display;
				}
			}
		}, {
			threshold: 0
		});

		this.particles = new Bag((i,s,a) => {
			if(a === Bag.ITEM_ADDED)
			{
				i.node && this.particleObserver.observe(i.node);
				i.node && this.tags.particles.appendChild(i.node);
			}
			else if(a === Bag.ITEM_REMOVED)
			{
				i.remove();
			}
		});

		this[Run] = 0;

		this.effects = new Bag;

		this.maxCameraBound = 64;
		this.cameraBound = 64;

		this.args.particles = this.particles.list;
		this.args.effects   = this.effects.list;

		this.args.maxFps = 60;

		this.args.currentActor = '';

		this.args.xOffset = 0.5;
		this.args.yOffset = 0.5;

		this.args.xOffsetTarget = 0.5;
		this.args.yOffsetTarget = 0.75;

		this.args.topLine = new CharacterString({value:''});
		this.args.status  = new CharacterString({value:''});
		this.args.focusMe = new CharacterString({value:''});

		this.args.labelChar = new CharacterString({value:'Char: '});

		this.args.labelX = new CharacterString({value:'x pos: '});
		this.args.labelY = new CharacterString({value:'y pos: '});

		this.args.demoIndicator = null;

		this.args.labelGround = new CharacterString({value:'Grounded: '});
		this.args.labelCamera = new CharacterString({value:'Camera: '});
		this.args.labelAngle  = new CharacterString({value:'Gnd theta: '});
		this.args.labelGSpeed = new CharacterString({value:'Gnd spd: '});
		this.args.labelXSpeed = new CharacterString({value:'X air spd: '});
		this.args.labelYSpeed = new CharacterString({value:'Y air spd: '});
		this.args.labelLayer  = new CharacterString({value:'Layer: '});
		this.args.labelMode   = new CharacterString({value:'Mode: '});
		this.args.labelFrame  = new CharacterString({value:'Frame ID: '});
		this.args.labelIgnore = new CharacterString({value:'Ignore: '});
		this.args.labelFps    = new CharacterString({value:'FPS: '});

		this.args.labelAirAngle  = new CharacterString({value:'Air theta: '});

		this.args.char   = new CharacterString({value:'...'});

		this.args.xPos   = new CharacterString({value:0});
		this.args.yPos   = new CharacterString({value:0});
		this.args.layer  = new CharacterString({value:0});
		this.args.gSpeed = new CharacterString({value:0, high: 199, med: 99, low: 49});
		this.args.ground = new CharacterString({value:''});
		this.args.xSpeed = new CharacterString({value:0});
		this.args.ySpeed = new CharacterString({value:0});
		this.args.mode   = new CharacterString({value:0});
		this.args.angle  = new CharacterString({value:0});
		this.args.ignore = new CharacterString({value:0});

		this.args.cameraMode = new CharacterString({value:0});

		this.args.airAngle   = new CharacterString({value:0});

		this.args.nowPlaying = new CharacterString({value:'Now playing'});
		this.args.trackName  = new CharacterString({value:'Ice cap zone act 1 theme'});

		this.args.fpsSprite = new CharacterString({value:0});
		this.args.frame     = new CharacterString({value:0});

		this.args.scoreLabel = new CharacterString({value:'SCORE:', color: 'yellow'});
		this.args.timerLabel = new CharacterString({value:'TIME: ',  color: 'yellow'});
		this.args.ringLabel  = new CharacterString({value:'RINGS: ', color: 'yellow'});

		this.args.actClearLabel = new CharacterString({value:'', color: 'yellow'});
		this.args.dialogLines   = [];

		this.args.perfectBonusLabel = new CharacterString({value:'PERFECT BONUS: ', color: 'yellow'});
		this.args.perfectBonus      = new CharacterString({value: 0});

		this.args.speedBonusLabel   = new CharacterString({value:'SPEED BONUS: ', color: 'yellow'});
		this.args.speedBonus        = new CharacterString({value: 0});

		this.args.ringBonusLabel    = new CharacterString({value:'RING BONUS: ', color: 'yellow'});
		this.args.ringBonus         = new CharacterString({value: 0});

		this.args.timeBonusLabel    = new CharacterString({value:'TIME BONUS: ', color: 'yellow'});
		this.args.timeBonus         = new CharacterString({value: 0});

		this.args.totalBonusLabel   = new CharacterString({value:'TOTAL: ', color: 'yellow'});
		this.args.totalBonus        = new CharacterString({value: 0});

		this.args.rings = new CharacterString({value:0});
		this.args.score = new CharacterString({value:0});
		this.args.timer = new CharacterString({value:'00:00'});

		this.args.ntsc = 'ntsc';

		this.args.frameId = -1;

		this.settings.bindTo('displace',  v => this.args.displacement = v ? 'on' : 'off');
		this.settings.bindTo('outline',   v => this.args.outline   = v);
		this.settings.bindTo('debugOsd',  v => this.args.debugOsd  = v);
		this.settings.bindTo('showHud',   v => this.args.showHud   = v);
		this.settings.bindTo('shortcuts', v => this.args.shortcuts = v);
		this.settings.bindTo('showFps',   v => this.args.showFps   = v);

		this.args.emeralds = [
			// 'green'
			// , 'cyan'
			// , 'white'
			// , 'orangered'
			// , 'yellow'
			// , 'purple'
		];

		for(const setting in this.settings)
		{
			const val = localStorage.getItem('sonic-3000-setting-v0.0.0=' + setting);

			try
			{
				this.settings[setting] = JSON.parse(val) ?? this.settings[setting];
			}
			catch(e)
			{
				console.warn(e);
			}
		}

		this.settings.bindTo((v,k)=>{

			localStorage.setItem('sonic-3000-setting-v0.0.0=' + k, JSON.stringify(v));

		});

		this.args.blockSize = 32;

		this.args.populated = false;

		this.args.willStick = false;
		this.args.stayStuck = false;

		this.args.willStick = true;
		this.args.stayStuck = true;

		this.args.width  = 32 * 16;
		this.args.height = 32 * 9;
		this.args.scale  = 2;

		if(Router.query.noScale)
		{
			this.args.width  = 32 * 14 * 2;
			this.args.height = 32 * 8  * 2;
			this.args.scale  = 1;
		}

		if(Router.query.bigScale)
		{
			this.args.width  = 32 * 60;
			this.args.height = 32 * 34;
			this.args.scale  = 1;
		}

		this.collisions = new Map;

		this.args.x = this.args.x || 0;
		this.args.y = this.args.y || 0;

		this.args.fgLayers = [];
		this.args.layers   = [];

		this.args.animation = '';

		this.regions = new Set;
		this.spawn   = new Set;
		this.auras   = new Set;
		this.recent  = new Set;

		this.actorsById = {};

		this.playable = new Set;

		this.actors = new Bag((i,s,a) => {
			if(a == Bag.ITEM_ADDED)
			{
				i.viewport = this;

				// this.quadCell.insert(i, i.args);
				// this.quadCell.insert(i, {x: i.args.x - i.args.width / 2, y: i.args.y});
				// this.quadCell.insert(i, {x: i.args.x + i.args.width / 2, y: i.args.y});

				this.setColCell(i);

				if(i instanceof Region)
				{
					this.regions.add(i);
				}

				if(i.controllable)
				{
					this.playable.add(i);
				}

				this.actorsById[i.args.id] = i;

				this.objectDb.add(i);
			}
			else if(a == Bag.ITEM_REMOVED)
			{
				i.viewport = null;

				i.remove();

				if(i[ColCell])
				{
					this.playable.delete(i);

					i[ColCell].delete(i);
				}

				if(i instanceof Region)
				{
					this.regions.delete(i);
				}

				this.auras.delete(i);

				delete this.actorsById[i.args.id];
				delete i[ColCell];

				// this.quadCell.remove(i);

				this.objectDb.remove(i);
			}
		});

		const critiera = [
			/^Art\s+$/, /^Collision\s+$/, /^Destructible\s+$/
		];
		const comparator = () => {};

		this.layerDb = new Classifier(critiera, comparator);
		this.objectDb = new Classifier(Object.values(ObjectPalette));

		this.blocks = new Bag;

		this.args.blocks = this.blocks.list;
		this.args.actors = this.actors.list;

		this.listen(window, 'gamepadconnected', event => this.padConnected(event));
		this.listen(window, 'gamepaddisconnected', event => this.padRemoved(event));

		this.colCellDiv = 0.75 * (this.args.width > this.args.height
			? this.args.width
			: this.args.height
		);

		this.colCellCache = new Map;
		this.colCells = new Map;

		this[ActorPointCache] = new Map;

		this.startTime = null;

		this.args.audio = true;

		this.nextControl = false;

		this.updateStarted = new Set;
		this.updateEnded = new Set;
		this.updated = new Set;

		this.args.xBlur = 0;
		this.args.yBlur = 0;

		// this.args.controlCard = View.from(require('../cards/sonic-controls.html'));
		this.args.controlCard = View.from(require('../cards/basic-controls.html'));
		this.args.moveCard    = View.from(require('../cards/basic-moves.html'));

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.replayInputs = [];
		this.replayFrames = new Map;

		this.args.standalone = '';
		this.args.fullscreen = '';
		this.args.initializing = 'initializing';

		this.args.muteSwitch = new ClickSwitch;

		this.args.muteSwitch.args.active = !!JSON.parse(localStorage.getItem('sonic-3000-audio-enabled')||0)

		this.args.muteSwitch.args.bindTo('active', v => this.args.audio = v);

		this.args.bindTo('audio', (v) => {
			localStorage.setItem('sonic-3000-audio-enabled', v);
		});

		this.args.showConsole = null;

		this.listen(document, 'keydown', (event) => {

			if(event.key === 'Escape')
			{
				this.args.showConsole = false
			}

			if(event.key === 'F10' || event.key === '`')
			{
				if(!this.args.subspace)
				{
					this.args.subspace = new Terminal({
						scroller: this.tags.subspace
						, path:{
							'input': InputTask
							, 'move': MoveTask
							, 'impulse': ImpulseTask
							, 'pos': PosTask
							, 'set': SettingsTask
							, 'spawn': SpawnTask
						}
					});

					// this.args.subspace.tasks.bindTo((v,k) => {
					// 	console.log(k,v);
					// });
				}

				this.args.showConsole = this.args.showConsole ? null : 'showConsole';

				event.preventDefault();
			}
		});

		this.args.bindTo('showConsole', v => {

			if(!this.args.subspace)
			{
				return;
			}

			if(v)
			{
				this.onNextFrame(()=>this.args.subspace.focus());
				this.args.showConsole = 'showConsole';
			}
			else
			{
				this.onNextFrame(()=>this.tags.viewport.focus());
				this.args.showConsole = null;
			}
		});

		this.controller = new Controller({deadZone: 0.2});

		this.controller.zero();
	}

	loadMap({mapUrl, networked = false})
	{
		const tileMap = new TileMap({ mapUrl });

		this.args.networked = networked;

		this.tileMap = tileMap;

		this.args.started = false;
		this.args.running = false;

		const load = new LoadingCard({
			timeout: -1
			, text: 'loading ... 0%'
		}, this);

		tileMap.addEventListener('level-progress', event => {
			const {received, length, done} = event.detail;
			load.args.text = `loading level ... ${(done*100).toFixed(4)}%`;
		});

		tileMap.addEventListener('texture-progress', event => {
			const {received, length, done} = event.detail;
			load.args.text = `loading textures ... ${(done*100).toFixed(4)}%`;
		});

		tileMap.ready.then(() => {
			this.args.layers.length = 0;

			const layers = this.tileMap.tileLayers;
			const layerCount = layers.length;

			for(let i = 0; i < layerCount; i++)
			{
				const layer = new Layer({
					layerId: i
					, viewport: this
					, name:     layers[i].name
					, width:    this.args.width
					, height:   this.args.height
				});

				if(layers[i].name.substring(0, 10) === 'Foreground')
				{
					this.args.fgLayers.push(layer);
				}
				else
				{
					this.args.layers.push(layer);
				}
			}
		});

		tileMap.ready.then(() => load.args.text = `starting level`);

		this.args.titlecard = new Series({cards:[load]}, this);

		this.args.titlecard.play();

		return tileMap.ready.then(() => this.startLevel());
	}

	fullscreen()
	{
		this.exitFullscreen();

		this.args.focusMe.args.hide = 'hide';

		this.initScale = this.args.scale;

		this.showStatus(3500, ' hit escape to revert. ');

		this.tags.viewport.node.requestFullscreen().then(res=>{
			this.onTimeout(100, ()=>{

				this.fitScale();

				this.args.fullscreen = 'fullscreen';

			});
		}).catch(e =>console.error(e));
	}

	exitFullscreen()
	{
		if(document.fullscreenElement)
		{
			document.exitFullscreen();
			this.showStatus(0, '');
			this.args.focusMe.args.hide = '';
			this.args.fullscreen = '';
			return;
		}
	}

	fitScale(fill = false)
	{
		const hScale = window.innerHeight / this.args.height;
		const vScale = window.innerWidth / this.args.width;

		if(fill)
		{
			this.args.scale = hScale > vScale ? hScale : vScale;
		}
		else
		{
			this.args.scale = hScale > vScale ? vScale : hScale;
		}

		this.tags.frame && this.tags.frame.style({
			'--width': this.args.width
			, '--height': this.args.height
			, '--scale': this.args.scale
		});
	}

	showStatus(timeout, text)
	{
		this.args.status.args.hide  = '';
		this.args.status.args.value = text;

		if(timeout >= 0)
		{
			this.onTimeout(timeout, ()=>{
				this.args.status.args.hide = 'hide';
			});
		}
	}

	onAttached(event)
	{
		SettingsTask.viewport = this;
		ImpulseTask.viewport = this;
		InputTask.viewport = this;
		MoveTask.viewport  = this;
		PosTask.viewport   = this;
		SpawnTask.viewport = this;

		this.buildDetect();
		this.cpuDetect();
		this.gpuDetect();

		this.onTimeout(100, () => this.fitScale(false));

		this.onTimeout(5500, () => this.args.ntsc = '');

		this.onTimeout((Router.query.map || Router.query.nointro) ? 0 : 23500, () => {
			this.args.focusMe.args.value = ' Click here to enable keyboard control. ';
		});

		this.tags.blurDistance.setAttribute('style', `filter:url(#motionBlur)`);
		this.tags.blurDistanceFg.setAttribute('style', `filter:url(#motionBlur)`);

		this.listen(this.tags.frame, 'click', (event) => {
			if(event.target === this.tags.frame.node)
			{
				this.tags.viewport.focus();
			}
		});

		this.listen(window, 'resize', (event) => {
			this.onTimeout(100, () => this.fitScale(false));
		});

		this.listen(document, 'fullscreenchange', (event) => {
			this.onTimeout(100, () => this.fitScale(false));
			if (!document.fullscreenElement)
			{
				this.args.scale = this.initScale;
				this.args.fullscreen = '';

				return;
			}
		});

		this.tags.frame.style({
			'--width': this.args.width
			, '--height': this.args.height
			, '--scale': this.args.scale
		});

		// this.update();

		if(!this.startTime)
		{
			this.startTime = 0;
		}

		this.args.started = false;
		this.args.running = false;
		this.args.paused  = false;

		this.listen(document.body, 'click', event => {
			if(event.target !== document.body)
			{
				return;
			}
			this.tags.viewport.focus();
		});

		this.args.scale = this.args.scale || 1;

		const keyboard = Keyboard.get();

		keyboard.listening = true

		keyboard.focusElement = this.tags.viewport.node;

		keyboard.codes.bindTo((v,k,t,d) => {
			if(v === -1)
			{
				this.sequences.map(s => s.check(k));
			}
		});

		this.tags.viewport.node.focus();

		if(0 || window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches)
		{
			this.args.standalone = 'standalone';

			document.title = 'Sonic 3000'

			this.listen(window, 'resize', () => this.fitScale(false));
			this.onTimeout(100, () => this.fitScale(false));
		}

		this.onTimeout(100, () => this.args.initializing = '');
	}

	setZoneCard()
	{
		this.args.zonecard = new Titlecard({waitFor: this.tileMap.ready}, this);

		if(this.tileMap.mapData && this.tileMap.mapData.properties)
		{
			for(const property of this.tileMap.mapData.properties)
			{
				const name = property.name.replace(/-/g, '_');

				this.meta[ name ] = property.value;
			}
		}

		const line1  = this.meta.titlecard_title_1;
		const line2  = this.meta.titlecard_title_2;
		const author = this.meta.titlecard_author;
		const number = this.meta.titlecard_number;

		this.args.zonecard.args.firstLine  = line1;
		this.args.zonecard.args.secondLine = line2;
		this.args.zonecard.args.creditLine = author;
		this.args.zonecard.args.actNumber  = number;

		this.args.actName = `${line1} ${line2} ${number}`;

		this.args.titlecard = new Series({
			cards:[this.args.zonecard]}, this
		);

		return this.args.titlecard.play();
	}

	fillBackground()
	{
		const backdropClass = BackdropPalette[ this.meta.backdrop ];

		delete this.args.backdrop;

		if(backdropClass)
		{
			this.args.backdrop = new backdropClass;
		}
		else
		{
			this.args.backdrop = null;
		}

		this.args.theme = this.meta.theme || 'construct';
	}

	startLevel(refresh = true)
	{
		this.args.fade = true;

		this.clearDialog();
		this.hideDialog();

		refresh && this.setZoneCard();

		this.args.startFrameId = this.args.frameId;

		this.fillBackground();

		if(this.args.networked)
		{
			const sonic = new Chalmers({name:'Player 1', x: 1500, y: 1600}, this);
			const tails = new Seymour({name:'Player 2', x: 1400, y: 1600}, this);

			this.auras.add(sonic);
			this.auras.add(tails);

			this.actors.add(sonic);
			this.actors.add(tails);

			sonic.render(this.tags.actors);
			sonic.onRendered();
			sonic.onAttached && sonic.onAttached();

			tails.render(this.tags.actors);
			tails.onRendered();
			tails.onAttached && tails.onAttached();
		}

		this.populateMap();

		for(const layer of [...this.args.layers, ...this.args.fgLayers])
		{
			layer.args.destroyed = false;
		}

		if(!this.args.networked)
		{
			const actors = this.actors.list;

			if(!this.playableIterator)
			{
				this.playableIterator = this.playable.entries();
			}

			this.nextControl = Object.values(this.args.actors)[0];
			// this.nextControl = this.nextControl || actors[0];

			if(Router.query.start)
			{
				const [x = 128, y = 128] = Router.query.start.split(',');

				console.log(x,y);

				this.nextControl.args.x = Number(x);
				this.nextControl.args.y = Number(y);
			}
			else if(!this.args.isReplaying && !this.args.isRecording)
			{
				this.args.demoIndicator = null;

				const storedPosition = this.getCheckpoint(this.nextControl.args.id);
				const checkpoint = storedPosition ? this.actorsById[storedPosition.checkpointId] : null;

				if(checkpoint)
				{
					this.args.startFrameId = this.args.frameId - storedPosition.frames;
					this.args.x = this.nextControl.args.x = checkpoint.x;
					this.args.y = this.nextControl.args.y = checkpoint.y;
				}
			}
		}
		else if(this.args.networked)
		{
			const actors = this.actors.list;

			this.nextControl = this.nextControl || actors[-1 + this.args.playerId];
		}

		if(this.nextControl && this.nextControl.controller)
		{
			this.nextControl.controller.zero();
		}
		else if(this.controller)
		{
			this.controller.zero();
		}

		Keyboard.get().reset();

		this.args.started = false;

		this.args.zonecard.played.then(() => {

			this.args.level = 'level';

			this.args.fade    = false;
			this.args.started = true;
			this.args.running = true;
			this.startTime    = Date.now();

			if(typeof ga === 'function')
			{
				ga('send', 'event', {
					eventCategory: 'zone',
					eventAction: 'started',
					eventLabel: `${this.args.actName}`
				});
			}
		});
	}

	takeInput(controller)
	{
		const keyboard = Keyboard.get();

		keyboard.update();

		if(!this.gamepad && !this.args.cutScene)
		{
			controller.readInput({keyboard});
		}
		else if(!this.args.cutScene)
		{
			const gamepads = navigator.getGamepads();

			for(let i = 0; i < gamepads.length; i++)
			{
				const gamepad = gamepads[i];

				if(!gamepad)
				{
					continue;
				}

				controller.readInput({keyboard, gamepad});

				if(gamepad)
				{
					const gamepadId = String(gamepad.id);

					if(gamepadId.match(/xbox/i))
					{
						this.args.inputType = 'input-xbox';
					}
					else if(gamepadId.match(/playstation/i))
					{
						this.args.inputType = 'input-playstation';
					}
					else
					{
						this.args.inputType = 'input-generic';
					}

				}
				else
				{
					this.args.inputName = 'keyboard';

					this.args.inputType = '';
				}
			}
		}

		if(this.controlActor && this.args.debugEditMode)
		{
			if(controller.buttons[0] && controller.buttons[0].time === 1)
			{
				const defKeys = Object.keys(ObjectPalette);

				const debugObjectType = defKeys[ this.args.debugObjectCursor ];

				if(!this.debugBank[debugObjectType])
				{
					this.debugBank[debugObjectType] = new ObjectPalette[debugObjectType];
				}

				const spawnObject = this.debugBank[debugObjectType];

				this.spawn.add({object:spawnObject});

				if(spawnObject.controllable)
				{
					spawnObject.args.name = 'SPAWN';

					this.playable.add(spawnObject);
				}

				spawnObject[Run] = this[Run];

				spawnObject.args.x = this.controlActor.x;
				spawnObject.args.y = this.controlActor.y;

				delete this.debugBank[debugObjectType];
			}

			if(controller.buttons[1] && controller.buttons[1].time === 1)
			{
				this.args.debugObjectCursor++;

				const defKeys = Object.keys(ObjectPalette);

				if(this.args.debugObjectCursor >= defKeys.length)
				{
					this.args.debugObjectCursor = 0;
				}

				const debugObjectType = defKeys[ this.args.debugObjectCursor ];

				if(!this.debugBank[debugObjectType])
				{
					this.debugBank[debugObjectType] = new ObjectPalette[debugObjectType];
				}

				while(this.tags.spawnPreview.node.firstChild)
				{
					this.tags.spawnPreview.node.firstChild.remove();
				}

				this.debugBank[debugObjectType].render(this.tags.spawnPreview.node);

				this.args.debugObjectName.args.value = debugObjectType;
			}

			if(controller.buttons[2] && controller.buttons[2].time === 1)
			{
				this.args.debugObjectCursor--;

				const defKeys = Object.keys(ObjectPalette);

				if(this.args.debugObjectCursor <= 0)
				{
					this.args.debugObjectCursor = defKeys.length - 1;
				}

				const debugObjectType = defKeys[ this.args.debugObjectCursor ];

				if(!this.debugBank[debugObjectType])
				{
					this.debugBank[debugObjectType] = new ObjectPalette[debugObjectType];
				}

				while(this.tags.spawnPreview.node.firstChild)
				{
					this.tags.spawnPreview.node.firstChild.remove();
				}

				this.debugBank[debugObjectType].render(this.tags.spawnPreview.node);

				this.args.debugObjectName.args.value = debugObjectType;
			}

		}

		if(this.args.debugEnabled)
		{
			if(controller.buttons[8] && controller.buttons[8].time === 1)
			{
				this.args.debugEditMode = !this.args.debugEditMode;
				this.settings.debugOsd = this.args.debugEditMode;
			}
		}

		if(controller.buttons[2011] && controller.buttons[2011].time === 1)
		{
			this.fullscreen();
		}

		if(controller.buttons[2008] && controller.buttons[2008].time === 1)
		{
			this.args.muteSwitch.args.active = !this.args.muteSwitch.args.active;
		}

		if(controller.buttons[2009] && controller.buttons[2009].time === 1)
		{
			this.settings.debugOsd = !this.settings.debugOsd;
		}

		if(controller.buttons[1011] && controller.buttons[1011].time === 1)
		{
			this.args.paused = 0;
			this.focus();
		}

		if(controller.buttons[1020] && controller.buttons[1020].time === 1)
		{
			if(!this.args.fullscreen)
			{
				this.args.paused
					? this.unpauseGame()
					: this.pauseGame();
			}

			this.exitFullscreen();
		}

		if(!this.args.networked && !this.args.paused)
		{
			if(!this.dontSwitch && controller.buttons[11] && controller.buttons[11].time === 1)
			{
				this.playableIterator = this.playableIterator || this.playable.entries();

				let next = this.playableIterator.next();

				if(next.done)
				{
					this.playableIterator = false;

					this.playableIterator = this.playable.entries();

					next = this.playableIterator.next();
				}

				if(next.value)
				{
					this.nextControl = next.value[0];

					this.dontSwitch = 3;
				}
			}
		}

		if(this.args.started)
		{
			if(this.controlActor)
			{
				this.args.currentSheild = this.controlActor.args.currentSheild
					? this.controlActor.args.currentSheild.type
					: '';
			}

			if(controller.buttons[9]
				&& controller.buttons[9].active
				&& controller.buttons[9].time === 1
			){
				if(this.args.paused)
				{
					this.unpauseGame();
				}
				else
				{
					this.pauseGame();
				}
			}

			if(this.args.isRecording)
			{
				if(!this.args.demoIndicator)
				{
					this.args.demoIndicator = new CharacterString({value:'⏺ REC', color: 'red'})
				}

				const frame = this.args.frameId;
				const input = controller.serialize();

				let args = {};

				if(this.controlActor)
				{
					args = {
						[this.controlActor.args.id]: {
							x: this.controlActor.args.x
							, y: this.controlActor.args.y
							, gSpeed: this.controlActor.args.gSpeed
							, xSpeed: this.controlActor.args.xSpeed
							, ySpeed: this.controlActor.args.ySpeed
						}
					};
				}

				this.replayFrames.set(frame, {frame, input, args});
			}
		}

		controller.update({gamepad:this.gamepad});
	}

	moveCamera()
	{
		if(!this.controlActor)
		{
			return;
		}

		if(this.cameraBound <= this.maxCameraBound)
		{
			this.cameraBound = this.maxCameraBound;
		}
		else
		{
			this.cameraBound -= 0.05;
		}

		let cameraSpeed = 30;

		let actor = this.controlActor;

		if(actor.args.standingOn && actor.args.standingOn.isVehicle)
		{
			actor = actor.args.standingOn;
		}

		const highJump  = actor.args.highJump;
		const deepJump  = actor.args.deepJump;
		const falling   = actor.args.falling;
		const fallSpeed = actor.args.ySpeed;

		switch(actor.args.cameraMode)
		{
			case 'cutScene':
				this.args.xOffsetTarget = [0.50, 0.25, 0.50, 0.75][actor.args.mode];
				this.args.yOffsetTarget = [0.70, 0.50, 0.45, 0.50][actor.args.mode];
				this.maxCameraBound = 64;
				cameraSpeed = 15;
				break;

			case 'corkscrew':
				this.args.xOffsetTarget = 0.5;
				this.args.yOffsetTarget = 0.75;
				this.maxCameraBound = 192;
				cameraSpeed = 64;
				break;

			case 'normal':
				this.args.xOffsetTarget = [0.50, 0.25, 0.50, 0.75][actor.args.mode];
				this.args.yOffsetTarget = [0.55, 0.50, 0.45, 0.50][actor.args.mode];
				this.maxCameraBound = 64;
				cameraSpeed = 24;
				break;

			case 'airplane': {
				const xSpeed     = actor.args.xSpeed;
				const absSpeed   = Math.abs(xSpeed);
				const shiftSpeed = 5;

				cameraSpeed = 20;

				const speedBias = Math.max(absSpeed / 100, 0.45) * -Math.sign(xSpeed);

				this.args.xOffsetTarget = 0.5 + speedBias;
				this.args.yOffsetTarget = 0.5;
				break;

			}

			// case 'railcar-aerial':
			// case 'railcar-normal':
			// 	this.args.xOffsetTarget = 0.5;
			// 	this.args.yOffsetTarget = 0.5;
			// 	this.maxCameraBound = 0;
			// 	cameraSpeed = 0;

			// 	break;

			case 'aerial':
				this.args.xOffsetTarget = 0.5;

				cameraSpeed = 30;

				if(!actor.args.flying && (deepJump || highJump))
				{
					if(fallSpeed < 0)
					{
						this.args.yOffsetTarget = 0.9;
					}
					else
					{
						this.args.yOffsetTarget = 0.35;

						// cameraSpeed = 15;
					}
				}
				else
				{
					this.args.yOffsetTarget = 0.5;
				}

				break;

			case 'cinematic':

				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.50;
				this.maxCameraBound     = 1;
				cameraSpeed = 0;

				break;

			case 'cliff':

				this.args.xOffsetTarget = 0.50 + -0.02 * actor.args.direction;
				this.args.yOffsetTarget = 0.45;

				cameraSpeed = 30;

				break;

			case 'bridge':

				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.40;

				cameraSpeed = 5;

				break;

			case 'boss':

				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.72;
				this.maxCameraBound     = 0;

				cameraSpeed = 3;

				break;

			case 'draggable':
				this.args.xOffsetTarget = 0.5;
				this.args.yOffsetTarget = 0.5;
				this.maxCameraBound     = 48;
				cameraSpeed = 3;
				break;

			default:
				this.maxCameraBound = 64;
				cameraSpeed = 25;
				break;

		}

		if(['normal', 'bridge', 'cliff', 'aerial', 'cutScene'].includes(actor.args.cameraMode))
		{
			const gSpeed     = actor.args.gSpeed;
			const xSpeed     = actor.args.xSpeed;
			const grounded   = !actor.args.falling;
			const absSpeed   = Math.abs(grounded ? gSpeed : xSpeed);
			const shiftSpeed = 17;
			const speedBias = Math.min(absSpeed / shiftSpeed, 1) * -Math.sign(gSpeed || xSpeed);

			switch(actor.args.mode)
			{
				case 0:
					this.args.xOffsetTarget += speedBias * 0.4;
					break;

				case 1:
					this.args.yOffsetTarget += speedBias * 0.4;
					break;

				case 2:
					this.args.xOffsetTarget -= speedBias * 0.4;
	 				break;

				case 3:
					this.args.yOffsetTarget -= speedBias * 0.4;
					break;
			}

			this.args.speedBias = speedBias;
		}

		this.args.xOffsetTarget = Math.max(0,Math.min(1,this.args.xOffsetTarget));

		if(actor.args.jumping)
		{
			this.maxCameraBound = 128;

			if(deepJump || highJump)
			{
				this.maxCameraBound = 12;
			}
		}

		let ySpeedBias = 0;
		let ySpeedMax  = 512;
		let ySpeed     = 0;

		if(actor.args.cameraMode !== 'boss')
		{
			if(!actor.args.falling && actor.args.mode === 1)
			{
				ySpeedMax = actor.args.gSpeedMax;
				ySpeed = actor.args.gSpeed / 12;
			}
			else if(!actor.args.falling && actor.args.mode === 3)
			{
				ySpeedMax = actor.args.gSpeedMax;
				ySpeed = -actor.args.gSpeed / 12;
			}

			if(actor.args.rolling)
			{
				ySpeed /= 4;
			}

			if(actor.args.falling && actor.args.ySpeed > 0)
			{
				if(deepJump || highJump)
				{
					ySpeed = actor.args.ySpeed;
				}

				if(actor.args.ySpeed > 0)
				{
					ySpeedBias += actor.args.ySpeed > 24 ? 0.5 : 0;
				}
				// else
				// {
				// 	ySpeedBias += (actor.args.deepJump || actor.args.ySpeed < -24) ? -0.5 : 0;
				// }
			}

			ySpeedBias += (ySpeed / ySpeedMax);
		}

		this.args.yOffsetTarget += actor.args.cameraBias - ySpeedBias;

		if(cameraSpeed)
		{
			const xOffsetDiff = this.args.xOffsetTarget - this.args.xOffset;
			const yOffsetDiff = this.args.yOffsetTarget - this.args.yOffset;

			this.args.xOffset += xOffsetDiff / cameraSpeed;
			this.args.yOffset += yOffsetDiff / cameraSpeed;
		}
		else
		{
			this.args.xOffset = this.args.xOffsetTarget;
			this.args.yOffset = this.args.yOffsetTarget;
		}

		const center = actor.rotatePoint(0, -actor.args.height / 2);

		const actorX = center[0] + -actor.x;
		const actorY = center[1] + -actor.y;

		const xNext = actorX + center[0] + this.args.width  * this.args.xOffset;
		const yNext = actorY + center[1] + this.args.height * this.args.yOffset;

		const xDiff = this.args.x + -xNext;
		const yDiff = this.args.y + -yNext;

		const distance = Math.sqrt(xDiff ** 2 + yDiff ** 2);
		const angle    = Math.atan2(yDiff, xDiff);

		const maxDistance = this.cameraBound;

		const dragDistance = Math.min(maxDistance, distance);

		const snapFactor = Math.abs(dragDistance / maxDistance);
		const snapFrames = 12;
		const snapSpeed  = dragDistance / snapFrames;

		let x = xNext + dragDistance * Math.cos(angle)
		let y = yNext + dragDistance * Math.sin(angle);

		x = x - snapFactor * Math.cos(angle) * snapSpeed;
		y = y - snapFactor * Math.sin(angle) * snapSpeed / 2;

		if(x > 96 && !this.meta.wrapX)
		{
			x = 96;
		}

		if(y > 96 && !this.meta.wrapY)
		{
			y = 96;
		}

		const xMax = -(this.tileMap.mapData.width * 32) + this.args.width - 96;
		const yMax = -(this.tileMap.mapData.height * 32) + this.args.height - 96;

		if(x < xMax && !this.meta.wrapX)
		{
			x = xMax;
		}

		if(y < yMax && !this.meta.wrapY)
		{
			y = yMax;
		}

		this.args.shakeX *= -0.95;
		this.args.shakeY *= -0.95;

		if(actor.args.dead && !actor.args.respawning)
		{
			this.args.x = x + this.args.shakeX;
		}
		else
		{
			this.args.x = x + this.args.shakeX;
			this.args.y = y + this.args.shakeY;
		}
	}

	applyMotionBlur()
	{
		const controlActor = this.controlActor;

		if(this.settings.blur && controlActor && this.tags.blur)
		{
			const xMoved = this.args.x - this.xPrev;
			const yMoved = this.args.y - this.yPrev;

			let xBlur = ((Number(xMoved) / 5) ** 2);
			let yBlur = ((Number(yMoved) / 5) ** 2);

			const maxBlur = 32;

			xBlur = xBlur < maxBlur ? xBlur : maxBlur;
			yBlur = yBlur < maxBlur ? yBlur : maxBlur;

			let blur = (Math.sqrt(xBlur**2 + yBlur**2) / 3);
			const blurAngle = Math.atan2(yMoved, xMoved);

			if(blur > 0.5)
			{
				this.tags.blurAngle.setAttribute('style', `transform:rotate(calc(1rad * ${blurAngle}))`);
				this.tags.blurAngleFg.setAttribute('style', `transform:rotate(calc(1rad * ${blurAngle}))`);
				this.tags.blurAngleCancel.setAttribute('style', `transform:rotate(calc(-1rad * ${blurAngle}))`);
				this.tags.blurAngleCancelFg.setAttribute('style', `transform:rotate(calc(-1rad * ${blurAngle}))`);
				this.tags.blur.setAttribute('stdDeviation', `${(blur * 0.75) - 1}, 0`);
			}
			else
			{
				this.tags.blurAngle.setAttribute('style', `transform:none;`);
				this.tags.blurAngleFg.setAttribute('style', `transform:none;`);
				this.tags.blurAngleCancel.setAttribute('style', `transform:none;`);
				this.tags.blurAngleCancelFg.setAttribute('style', `transform:none;`);
				this.tags.blur.removeAttribute('stdDeviation');
			}

			this.xPrev = this.args.x;
			this.yPrev = this.args.y;
		}
		else
		{
			this.tags.blurAngle.setAttribute('style', `transform:none;`);
			this.tags.blurAngleFg.setAttribute('style', `transform:none;`);
			this.tags.blurAngleCancel.setAttribute('style', `transform:none;`);
			this.tags.blurAngleCancelFg.setAttribute('style', `transform:none;`);
			this.tags.blur.removeAttribute('stdDeviation');
		}
	}

	updateBackground()
	{
		let controlActor = this.controlActor;

		if(controlActor && controlActor.standingOn && controlActor.standingOn.isVehicle)
		{
			controlActor = this.controlActor.standingOn;
		}

		this.tags.bgFilters.style({
			'--x': this.args.x
			, '--y': this.args.y
		});

		this.tags.content.style({
			'--x': this.args.x
			, '--y': this.args.y
			, '--outlineWidth': this.settings.outline + 'px'
		});

		const xMod = this.args.x <= 0
			? (this.args.x % (this.args.blockSize))
			: (-this.args.blockSize + (this.args.x % this.args.blockSize)) % this.args.blockSize;

		const yMod = this.args.y <= 0
			? (this.args.y % (this.args.blockSize))
			: (-this.args.blockSize + (this.args.y % this.args.blockSize)) % this.args.blockSize;

		this.tags.background.style({transform: `translate( ${xMod}px, ${yMod}px )`});
		this.tags.foreground.style({transform: `translate( ${xMod}px, ${yMod}px )`});

		this.tags.frame.style({
			'--width':    this.args.width
			, '--height': this.args.height
			, '--scale':  this.args.scale
		});
	}

	updateBackdrops()
	{
		for(const [,backdrop] of this.backdrops)
		{
			if(!backdrop.view)
			{
				const args = {};

				let backdropType = '';

				for(const property of backdrop.properties)
				{
					if(property.name === 'backdrop')
					{
						backdropType = property.value;
						continue;
					}

					args[ property.name ] = property.value;
				}

				args.width  = backdrop.width;
				args.height = backdrop.height;

				args.bX = backdrop.x;
				args.bY = backdrop.y;

				if(backdropType === 'protolabrynth')
				{
					backdrop.view = new ProtoLabrynth(args, this);

					backdrop.view.render( this.tags.backdrops );
				}
				else if(backdropType === 'mystic-cave')
				{
					backdrop.view = new MysticCave(args, this);

					backdrop.view.render( this.tags.backdrops );
				}
			}

			const leftIntersect   = this.args.width  + -this.args.x + -backdrop.x;
			const rightIntersect  = -(-backdrop.width + -this.args.x + -backdrop.x);
			const topIntersect    = this.args.height + -this.args.y + -backdrop.y;
			const bottomIntersect = -(-backdrop.height + -this.args.y + -backdrop.y);

			const xMax = this.tileMap ? -(this.tileMap.mapData.width * 32) : 2 ** 9;
			const yMax = this.tileMap ? -(this.tileMap.mapData.height * 32) : 2 ** 9;

			backdrop.view && Object.assign(backdrop.view.args, ({
				x: this.args.x
				, xPan: this.args.x
				, xMax: xMax
				, y: this.args.y + backdrop.y
				, yMax: this.args.y + backdrop.y + -backdrop.view.stacked
				, stacked: -backdrop.view.stacked + 'px'
				, frame: this.args.frameId
				, top: topIntersect
				, bottom: bottomIntersect
			}));
		}

		this.tileMap && this.tileMap.ready.then(() => {
			const xMax = this.tileMap ? -(this.tileMap.mapData.width * 32) : 2 ** 9;
			const yMax = this.tileMap ? -(this.tileMap.mapData.height * 32) : 2 ** 9;

			this.args.backdrop && Object.assign(this.args.backdrop.args, ({
				x: 0
				, xPan: this.args.x
				, y: this.args.y + this.args.yOffset
				, xMax: xMax ?? 0
				, yMax: yMax ?? 0
				, frame: this.args.frameId
				, stacked: -this.args.backdrop.stacked + 'px'
			}));
		});
	}

	populateMap()
	{
		if(this.args.populated)
		{
			return;
		}

		const mapWidth  = this.tileMap.mapData.width * 32 + 64;
		const mapHeight = this.tileMap.mapData.height * 32 + 64;

		// this.quadCell = new QuadCell(
		// 	{x: mapWidth/2, y: mapHeight/2}
		// 	, {x: mapWidth, y: mapHeight}
		// );

		this.args.populated = true;

		const objDefs = this.tileMap.getObjectDefs();

		this.objDefs = new Map;

		for(const [id,backdrop] of this.backdrops)
		{
			if(backdrop.view)
			{
				backdrop.view.remove();

				backdrop.view = undefined;
			}

			this.backdrops.delete(id);
		}

		for(const particle of this.particles.list)
		{
			if(particle)
			{
				particle.remove();

				this.particles.remove(particle);
			}
		}

		for(let i in objDefs)
		{
			const objDef  = objDefs[i];
			const objType = objDef.type;

			if(objType === 'particle')
			{
				const particle = new Particle3d;

				particle.style({'--x': objDef.x, '--y': objDef.y});

				this.particles.add(particle.node);
			}

			if(objType === 'backdrop')
			{
				this.backdrops.set(objDef.id, objDef);
				continue;
			}

			this.objDefs.set(objDef.id, objDef);

			if(!ObjectPalette[objType])
			{
				continue;
			}

			if(this.args.networked)
			{
				if(![
					'layer-switch'
					, 'ring'
					, 'companion-block'
					, 'region'
					, 'force-region'
					, 'shade-region'
					, 'rolling-region'
					, 'water-region'
					, 'lava-region'
					, 'block'
					, 'switch'
					, 'base-region'
					, 'water-region'
					, 'force-region'
					, 'rolling-region'
					, 'lava-region'
					, 'q-block'
					, 'sheild-fire-monitor'
					, 'sheild-water-monitor'
					, 'sheild-electric-monitor'
				].includes(objType)){
					continue;
				}
			}

			const objClass = ObjectPalette[objType];
			const rawActor = objClass.fromDef(objDef);

			rawActor[Run] = this[Run];

			rawActor[ Bindable.NoGetters ] = true;

			const actor = Bindable.make(rawActor);

			this.actors.add( actor );

			if(this.actorIsOnScreen(actor))
			{
				actor.render(this.tags.actors);

				actor.args.display = actor.defaultDisplay || null;

				if(actor.onAttach && actor.onAttach() === false)
				{
					actor.detach();
				}
			}
			else
			{
				actor.args.display = 'none';
				actor.detach();
			}

			// actor.onRendered();

			if(actor.controllable)
			{
				actor.name = objDef.name;

				// this.auras.add( actor );

				actor.args.display = actor.defaultDisplay || null;
			}
		}

		for(const actor of this.actors.list)
		{
			if(!actor)
			{
				continue;
			}

			const position = this.getCheckpoint(actor.args.id);

			if(position && position.checkpointId)
			{
				const checkpoint = this.actorsById[position.checkpointId];

				if(checkpoint)
				{
					actor.args.x = checkpoint.x;
					actor.args.y = checkpoint.y;
				}
			}
		}
	}

	actorIsOnScreen(actor, margin = 512)
	{
		if(!actor)
		{
			return;
		}

		const width  = this.args.width;
		const height = this.args.height;

		const camLeft   = -this.args.x + -16 + -margin;
		const camRight  = -this.args.x +  16 +  margin + width;

		const camTop    = -this.args.y - margin;
		const camBottom = -this.args.y + height + margin;

		const actorWidth = actor.args.width;

		const actorTop   = actor.y - actor.args.height;

		const actorLeft  = actor.x - (actor.isRegion ? 0 : actorWidth / 2);
		const actorRight = actor.x + (actor.isRegion ? actorWidth : (actorWidth / 2));

		if(camLeft > actorRight || actorLeft > camRight)
		{
			return false;
		}

		if(camTop > actor.y || actorTop > camBottom)
		{
			return false;
		}

		return true;

		// if((camLeft < actorRight && camRight > actorLeft)
		// 	&& camTop < actor.y && camBottom > actorTop
		// ){
		// 	return true;
		// }
		// else if((actorLeft < camRight && actorRight > camLeft)
		// 	&& actorTop < camBottom && actor.y > camTop
		// ){
		// 	return true;
		// }
		// else
		// {
		// 	return false;
		// }
	}

	spawnActors()
	{
		const actorDoc  = new DocumentFragment;
		const regionDoc = new DocumentFragment;

		let actorSpawned  = false;
		let regionSpawned = false;

		for(const spawn of this.spawn)
		{
			if(spawn.frame)
			{
				if(spawn.frame <= this.args.frameId)
				{
					this.spawn.delete(spawn);

					spawn.object[ Bindable.NoGetters ] = true;

					spawn.object[Run] = this[Run];

					spawn.object.startFrame = this.args.frameId;

					this.actors.add(Bindable.make(spawn.object));

					const isRegion = spawn.object instanceof Region;

					const doc = isRegion
						? actorDoc
						: actorDoc;

					spawn.object.render(doc);
					spawn.object.onRendered();
					spawn.object.onAttached && spawn.object.onAttached()

					if(spawn.object.onAttach && spawn.object.onAttach() === false)
					{
						if(!spawn.object.args.hidden)
						{
							spawn.object.detach();
						}
					}

					if(isRegion)
					{
						actorSpawned = true;
					}
					else
					{
						actorSpawned = true;
					}

				}
			}
			else
			{
				this.spawn.delete(spawn);

				spawn.object[ Bindable.NoGetters ] = true;

				spawn.object[Run] = this[Run];

				spawn.object.startFrame = this.args.frameId;

				this.actors.add(Bindable.make(spawn.object));

				spawn.object.render(actorDoc);
				spawn.object.onRendered();
				spawn.object.onAttached && spawn.object.onAttached()

				if(spawn.object.onAttach && spawn.object.onAttach() === false)
				{
					spawn.object.detach();
				}

				actorSpawned = true;
			}
		}

		if(actorSpawned)
		{
			this.tags.actors.append(actorDoc);
		}

		if(regionSpawned)
		{
			this.tags.actors.append(regionDoc);
		}
	}

	actorUpdateStart(actor)
	{
		if(this.updateStarted.has(actor))
		{
			return;
		}

		this.updateStarted.add(actor);

		actor.updateStart();

		if(actor.colliding)
		{
			actor.colliding = false;
		}
	}

	actorUpdate(actor)
	{
		if(this.updated.has(actor))
		{
			return;
		}

		this.updated.add(actor);

		actor.update();
	}

	actorUpdateEnd(actor)
	{
		if(this.updateEnded.has(actor))
		{
			return;
		}

		this.updateEnded.add(actor);

		actor.args.colliding = actor.colliding;

		actor.updateEnd();

		this.setColCell(actor);

		// this.quadCell.remove(actor, actor.args);

		// this.quadCell.insert(actor, actor.args);

		// this.quadCell.insert(actor, {x: actor.args.x - actor.args.width / 2, y: actor.args.y});
		// this.quadCell.insert(actor, {x: actor.args.x + actor.args.width / 2, y: actor.args.y});
	}

	nearbyActors(actor)
	{
		// const nearbyActors = this.quadCell.select(actor.x, actor.y, x, y);

		// return nearbyActors;

		const nearbyCells = this.getNearbyColCells(actor);

		const width  = this.args.width;
		const height = this.args.height;
		const x = this.args.x;
		const y = this.args.y;

		const result = new Set;

		for(const i in nearbyCells)
		{
			const cell   = nearbyCells[i];
			const actors = cell;

			for(const actor of actors)
			{
				if(actor.removed)
				{
					continue;
				}

				result.add(actor);
			}
		}

		return result;
	}

	update()
	{
		const controller = this.controlActor
			? this.controlActor.controller
			: this.controller;

		if(this.args.frameId % 600 === 0)
		{
			ga('set', 'metric1', this.args.frameId / 60);

			if(typeof ga === 'function')
			{
				ga('send', 'event', {
					eventCategory: 'fps-check',
					eventAction: `fps-check::${navigator.platform}::cores_${navigator.hardwareConcurrency}`,
					eventLabel: `${this.args.actName}`,
					eventValue: Math.trunc(this.args.fps)
				});
			}
		}

		if(!this.args.started)
		{
			this.startTime = Date.now();

			if(controller)
			{
				this.takeInput(controller);

				if(this.args.titlecard)
				{
					this.args.titlecard.input(controller);
				}
			}
		}

		if(this.args.paused !== false && !this.args.networked)
		{
			this.takeInput(controller);

			this.args.pauseMenu.input(controller);
		}
		else
		{
			this.args.pauseMenu.args.hideMenu = 'pause-menu-hide';
		}

		if(this.args.paused === false || this.args.paused > 0 || this.args.networked)
		{
			this.callFrameOuts();
			this.callFrameIntervals();

			this.args.lastFrameId = this.args.frameId;

			if(this.args.cutScene)
			{
				this.args.startFrameId++;

				this.args.showHud = false;
			}
			else
			{
				this.args.showHud = true;
			}

			if(!this.args.debugEditMode)
			{
				this.args.frameId++;
			}

			this.args.frame.args.value = this.args.frameId;
		}

		if(this.args.started && (this.args.paused !== false && this.args.paused <= 0))
		{
			return;
		}

		if(this.args.paused > 0)
		{
			this.args.paused--;
		}

		this.updateBackdrops();

		if(!this.args.started)
		{
			return;
		}

		for(const [detachee, detacher] of this.willDetach)
		{
			this.willDetach.delete(detachee);

			detacher();
		}

		if(!Number(this.args.rings.args.value))
		{
			this.args.ringLabel.args.color = 'red-alert';
		}
		else
		{
			this.args.ringLabel.args.color = 'yellow';
		}

		this.args.fpsSprite.args.value = Number(this.args.fps).toFixed(2);

		const time  = (this.args.frameId - this.args.startFrameId) / 60;
		let minutes = String(Math.trunc(Math.abs(time) / 60)).padStart(2,'0')
		let seconds = String(Math.trunc(Math.abs(time) % 60)).padStart(2,'0');

		const neg = time < 0 ? '-' : '';

		if(neg)
		{
			minutes = Number(minutes);
		}

		this.args.timer.args.value = `${neg}${minutes}:${seconds}`;

		if(this.dontSwitch > 0)
		{
			this.dontSwitch--;
		}

		if(this.dontSwitch < 0)
		{
			this.dontSwitch = 0;
		}

		this.args.rippleFrame = this.args.frameId % 128;
		this.args.displaceWater = this.args.frameId % 128;

		this[ActorPointCache].clear();

		if(!this.args.isReplaying && !this.args.isRecording)
		{
			this.args.demoIndicator = null;
		}

		this.updateBackground();

		if(this.controlActor)
		{
			if(this.args.isReplaying)
			{
				if(!this.args.demoIndicator)
				{
					this.args.demoIndicator = new CharacterString({value:'▶ PLAY', color: 'green'})
				}

				this.args.focusMe.args.hide = 'hide';

				if(this.replayFrames.has(this.args.frameId))
				{
					const frame = this.replayFrames.get(this.args.frameId);

					for(const actorId in frame.args)
					{
						const actor = this.actorsById[actorId];

						if(frame.input)
						{
							actor.controller.replay(frame.input);
							actor.readInput();
						}

						if(frame.args)
						{
							Object.assign(actor.args, frame.args[actorId]);
						}
					}

					this.args.hasRecording = true;

					this.args.topLine.args.value = ' i cant believe its not canvas. ';
					this.args.topLine.args.hide = '';

					this.args.status.args.value = ' click here to exit demo. ';
					this.args.status.args.hide = '';
				}
				else
				{
					this.args.topLine.args.hide = 'hide';
					this.args.status.args.hide = 'hide';

					this.args.isReplaying = false;
				}
			}
			else
			{
				if(this.gamepad)
				{
					this.args.focusMe.args.hide = 'hide';
				}

				this.controlActor.controller && this.takeInput(this.controlActor.controller);

				if(!this.args.cutScene)
				{
					this.controlActor.readInput();
				}
			}
		}

		this.collisions = new Map;

		this.updateStarted.clear();
		this.updated.clear();
		this.updateEnded.clear();

		for(const layer of [...this.args.layers, ...this.args.fgLayers])
		{
			const xDir = Math.sign(layer.x - this.args.x);
			const yDir = Math.sign(layer.y - this.args.y);

			layer.x = this.args.x;
			layer.y = this.args.y;

			layer.update(this.tileMap, xDir, yDir);
		}

		for(const layer of [...this.args.layers, ...this.args.fgLayers])
		{
			layer.move();
		}

		if(this.args.running && !this.args.debugEditMode)
		{
			const updatable = new Set;

			for(const region of this.regions)
			{
				if(!this.actorIsOnScreen(region, 768))
				{
					continue;
				}

				updatable.add(region);
			}

			for(const actor of this.auras)
			{
				if(actor !== this.controlActor)
				{
					updatable.add(actor);
				}

				const nearbyActors = this.nearbyActors(actor);

				for(const actor of nearbyActors)
				{
					if(actor !== this.controlActor)
					{
						updatable.add(actor);
					}
				}
			}

			for(const actor of updatable)
			{
				if(actor[Run] === this[Run])
				{
					this.actorUpdateStart(actor);
				}
			}

			if(this.controlActor)
			{
				if(this.controlActor[Run] === this[Run])
				{
					this.actorUpdateStart(this.controlActor);
				}
			}

			for(const actor of updatable)
			{
				if(actor[Run] === this[Run])
				{
					this.actorUpdate(actor);
				}
			}

			if(this.controlActor)
			{
				if(this.controlActor[Run] === this[Run])
				{
					this.actorUpdate(this.controlActor);
				}
			}

			for(const actor of updatable)
			{
				if(actor[Run] === this[Run])
				{
					this.actorUpdateEnd(actor);
				}
			}

			if(this.controlActor)
			{
				if(this.controlActor[Run] === this[Run])
				{
					this.actorUpdateEnd(this.controlActor);
				}
			}

			for(const actor of updatable)
			{
				if(actor[Run] === this[Run])
				{
					this.setColCell(actor);
				}
			}

			if(this.controlActor)
			{
				if(this.controlActor[Run] === this[Run])
				{
					this.setColCell(this.controlActor);
				}
			}

			if(this.collisions)
			{
				for(const [collider, collidees] of this.collisions)
				{
					for(const [collidee, type] of collidees)
					{
						if(!collidee)
						{
							continue;
						}

						collidee.pause(false);
					}
				}
			}

			if(this.controlActor)
			{
				this.args.score.args.value = String(this.controlActor.args.score).padStart(4, ' ');
				this.args.rings.args.value = String(this.controlActor.args.rings).padStart(4, ' ');

				this.args.hasRings    = !!this.controlActor.args.rings;
				this.args.hasEmeralds = !!this.controlActor.args.emeralds;
				this.args.char.args.value = this.controlActor.args.name;
				this.args.charName        = this.controlActor.args.name;

				if(this.args.debugOsd)
				{
					this.args.xPos.args.value     = Number(this.controlActor.x).toFixed(3);
					this.args.yPos.args.value     = Number(this.controlActor.y).toFixed(3);
					this.args.layer.args.value    = Number(this.controlActor.args.layer);

					this.args.ground.args.value   = this.controlActor.args.landed;
					this.args.gSpeed.args.value   = Number(this.controlActor.args.gSpeed).toFixed(3);

					this.args.xSpeed.args.value   = Number(this.controlActor.args.xSpeed).toFixed(3);
					this.args.ySpeed.args.value   = Number(this.controlActor.args.ySpeed).toFixed(3);

					this.args.angle.args.value    = (Math.round((this.controlActor.args.groundAngle) * 1000) / 1000).toFixed(3);
					this.args.airAngle.args.value = (Math.round((this.controlActor.args.airAngle) * 1000) / 1000).toFixed(3);

					this.args.ignore.args.value   = this.controlActor.args.ignore;

					const modes = ['FLOOR (0)', 'L-WALL (1)', 'CEILING (2)', 'R-WALL (3)'];

					this.args.mode.args.value = modes[Math.floor(this.controlActor.args.mode)] || Math.floor(this.controlActor.args.mode);
					this.args.cameraMode.args.value = this.controlActor.args.cameraMode;
				}
			}
		}
		else if(this.args.running && this.args.debugEditMode)
		{
			if(this.controlActor)
			{
				this.controlActor.args.x += controller.axes[0].magnitude * 4;
				this.controlActor.args.y += controller.axes[1].magnitude * 4;

				this.controlActor.args.respawning = false;
				this.controlActor.args.dead = false;
				this.controlActor.noClip = false;

				this.controlActor.args.xSpeed = 0;
				this.controlActor.args.ySpeed = 0;
				this.controlActor.args.gSpeed = 0;
			}
		}

		this.updated.forEach(actor => {
			if(actor.args.standingLayer)
			{
				actor.args.x += actor.args.standingLayer.offsetXChanged;
				actor.args.y += actor.args.standingLayer.offsetYChanged;
			}
		});

		const width  = this.args.width;
		const height = this.args.height;
		const margin = 16;

		const camLeft   = -this.args.x + -16 + -margin;
		const camRight  = -this.args.x + width + -16 + margin;

		const camTop    = -this.args.y - margin;
		const camBottom = -this.args.y + height + margin;

		const inAuras = new WeakSet;

		if(this.controlActor)
		{
			const actorDoc = new DocumentFragment;
			const regionDoc = new DocumentFragment;

			let wakeActors = false;
			let wakeRegions = false;

			const nearbyActors = this.nearbyActors(this.controlActor) || [];

			for(const actorList of [nearbyActors, this.regions])
			{
				for(const actor of actorList)
				{
					if(actor[Run] !== this[Run])
					{
						continue;
					}

					if(!actor.nodes.length)
					{
						actor.render(this.tags.actors);
					}

					const actorIsOnScreen = this.actorIsOnScreen(actor);

					if(actorIsOnScreen && !(actor instanceof LayerSwitch))
					{
						actor.args.display = actor.defaultDisplay || null;

						if(!actor.vizi)
						{
							if(!actor.nodes.length)
							{
								if(actor.onAttach && actor.onAttach() === false)
								{
									actor.detach();
								}
							}

							if(!actor.args.hidden)
							{
								if(actor instanceof Region)
								{
									actor.nodes.map(n => actorDoc.append(n));
									wakeActors = true;
								}
								else
								{
									actor.nodes.map(n => actorDoc.append(n));
									wakeActors = true;
								}
							}

							actor.wakeUp();
						}

						this.willDetach.delete(actor);

						actor.vizi = true;
					}

					inAuras.add(actor);

					this.recent.add(actor);
				}
			}

			for(const actor of this.recent)
			{
				if(actor[Run] !== this[Run])
				{
					this.recent.delete(actor);
					continue;
				}

				const actorIsOnScreen = this.actorIsOnScreen(actor);

				if(actor.vizi && !this.willDetach.has(actor) && !actorIsOnScreen)
				{
					this.willDetach.set(actor, () => {

						actor.sleep();
						actor.args.display = 'none';
						actor.detach();
						actor.vizi = false;
						actor.willhide = null;

						this.willDetach.delete(actor);

					});

					this.recent.delete(actor);
				}
			}

			if(wakeActors)
			{
				this.tags.actors.append(actorDoc);
			}

			if(wakeRegions)
			{
				this.tags.actors.append(regionDoc);
			}
		}

		if(this.nextControl)
		{
			!this.args.networked && this.auras.clear();

			this.controlActor
				&& this.controlActor.sprite
				&& this.controlActor.sprite.parentNode
				&& this.controlActor.sprite.parentNode.classList.remove('actor-selected');

			if(this.controlActor)
			{
				this.controlActor.args.selected = false;
			}

			this.controlActor = this.nextControl;

			this.controlActor.args.selected = true;

			this.auras.add(this.controlActor);

			this.controlActor.args.display = this.controlActor.defaultDisplay || null;

			this.controlActor.nodes.map(n => this.tags.actors.append(n));

			this.controlActor.vizi = true;

			this.args.maxSpeed = null;
			this.nextControl   = null;
		}

		if(this.controlActor)
		{
			this.controlActor.setCameraMode();

			this.moveCamera();

			this.applyMotionBlur();

			if(this.controlActor.args.name === 'seymour'
				&& this.controlActor.y < 3840
				&& this.controlActor.x > 38400
				&& this.controlActor.standingOn
				&& this.controlActor.standingOn.isVehicle
			){
				this.args.secret = 'aurora';

				if(!this.secretsFound.has('seymour-aurora'))
				{
					if(this.args.audio && this.secretSample)
					{
						this.secretSample.currentTime = 0;
						this.secretSample.volume = 0.25;
						this.secretSample.play();
					}

					this.showStatus(10000, ' A secret is revealed ');

					this.secretsFound.add('seymour-aurora');
				}
			}
			else
			{
				this.args.secret = '';
			}
		}

		if(this.args.networked && this.controlActor)
		{
			const netState = {frame:this.serializePlayer()};

			if(this.args.playerId === 1)
			{
				this.server.send(JSON.stringify(netState));
			}
			else if(this.args.playerId === 2)
			{
				this.client.send(JSON.stringify(netState));
			}
		}

		this.spawnActors();
	}

	click(event)
	{
		if(this.args.isReplaying)
		{
			this.controlActor.controller.zero();
			this.stop();
		}
	}

	regionsAtPoint(x, y)
	{
		const regions = new Set;

		for(const region of this.regions)
		{
			if(region[Run] !== this[Run])
			{
				continue;
			}

			const regionArgs = region.args;

			const regionX = regionArgs.x;
			const regionY = regionArgs.y;

			const width  = regionArgs.width;
			const height = regionArgs.height;

			const offset = Math.floor(width / 2);

			const left   = regionX;
			const right  = regionX + width;

			const top    = regionY - height;
			const bottom = regionY;

			if(x >= left && right > x)
			{
				if(bottom >= y && y > top)
				{
					regions.add(region);
				}
			}
		}

		return regions;
	}

	actorsAtPoint(x, y, w = 0, h = 0)
	{
		const cacheKey = x+'::'+y+'::'+w+'::'+h;
		const actorPointCache = this[ActorPointCache];

		if(actorPointCache.has(cacheKey))
		{
			return actorPointCache.get(cacheKey);
		}

		const actors = [];

		const nearbyActors = this.nearbyActors({x,y});

		for(const actor of nearbyActors)
		{
			if(actor[Run] !== this[Run])
			{
				continue;
			}

			const actorArgs = actor.args;

			const actorX = actorArgs.x;
			const actorY = actorArgs.y;

			const width  = actorArgs.width;
			const height = actorArgs.height;

			const myRadius = Math.max(Math.floor(w / 2), 0);

			const myLeft   = x - myRadius;
			const myRight  = x + myRadius;
			const myTop    = y - Math.max(h, 0);
			const myBottom = y;

			const offset = width / 2;

			const isRegion = actor.isRegion;

			const otherLeft   = actorX - (isRegion ? 0 : offset);
			const otherRight  = actorX + (isRegion ? width : offset);
			const otherTop    = actorY - height ;
			const otherBottom = actorY;

			if(myRight >= otherLeft && otherRight > myLeft)
			{
				if(otherBottom >= myTop && myBottom >= otherTop)
				{
					actors.push( actor );
				}
			}
		}

		actorPointCache.set(cacheKey, actors);

		return actors;
	}

	padConnected(event)
	{
		this.gamepad = event.gamepad;

		if(typeof ga === 'function')
		{
			ga('send', 'event', {
				eventCategory: 'gamepad',
				eventAction: 'connected',
				eventLabel: event.gamepad.id
			});
		}
	}

	padRemoved(event)
	{
		if(!this.gamepad)
		{
			return;
		}

		if(this.gamepad.index === event.gamepad.index)
		{
			this.gamepad = null;
		}

		if(typeof ga ==='function')
		{
			ga('send', 'event', {
				eventCategory: 'gamepad',
				eventAction: 'disconnected',
				eventLabel: event.gamepad.id
			});
		}
	}

	getColCell(point)
	{
		const colCellDiv = this.colCellDiv;
		const colCells   = this.colCells;

		const cellX = Math.floor( point.x / colCellDiv );
		const cellY = Math.floor( point.y / colCellDiv );

		const name = `${cellX}:${cellY}`;

		if(!colCells.has(name))
		{
			const cell = new Set;

			colCells.set(name, cell);

			cell.name = name;

			return cell;
		}

		return colCells.get(name);
	}

	getColCells(actor)
	{
		const colCellDiv = this.colCellDiv;

		const actorTop   = actor.y - actor.args.height;

		const actorWidth = actor.args.width;

		const actorLeft  = actor.x - actorWidth / 2;
		const actorRight = actor.x + actorWidth / 2;

		const cellMinX = Math.floor( actorLeft  / colCellDiv );
		const cellMaxX = Math.ceil( actorRight / colCellDiv );

		const cellMinY = Math.floor( actorTop / colCellDiv );
		const cellMaxY = Math.ceil( actor.y  / colCellDiv );

		const cells = new Set;

		for(let x = cellMinX; x <= cellMaxX; x++)
		{
			for(let y = cellMinY; y <= cellMaxY; y++)
			{
				cells.add( this.getColCell({x:x*colCellDiv,y:y*colCellDiv}) );
			}
		}

		return cells;
	}

	setColCell(actor)
	{
		actor[ Bindable.NoGetters ] = true;

		actor = Bindable.make(actor);

		const cell = this.getColCell(actor);

		actor[ColCell] && actor[ColCell].delete(actor);

		cell.add(actor);

		actor[ColCell] = cell;

		return cell;

		// const cells = this.getColCell(actor);

		// const originalCells = actor[ColCell] || new Set;

		// cells.forEach(cell => cell.add(actor));

		// originalCells.forEach(originalCell => {
		// 	if(!cells.has(originalCell))
		// 	{
		// 		originalCell.delete(actor);
		// 	}
		// });

		// actor[ColCell] = cells;

		// return cells;
	}

	getNearbyColCells(actor)
	{
		const actorX = actor.x;
		const actorY = actor.y;

		const colCellDiv = this.colCellDiv
		const cellX = Math.floor( actorX / colCellDiv );
		const cellY = Math.floor( actorY / colCellDiv );

		const name = `${cellX}::${cellY}`;

		let cache = this.colCellCache.get(name);

		if(cache)
		{
			return cache.filter(set=>set.size);
		}

		const space = colCellDiv;

		const colA = actorX - space * 2;
		const colB = actorX - space;
		const colC = actorX;
		const colD = actorX + space;
		const colE = actorX + space * 2;

		const rowA = actorY - space * 2;
		const rowB = actorY - space;
		const rowC = actorY;
		const rowD = actorY + space;
		const rowE = actorY + space * 2;

		this.colCellCache.set(name, cache = [
			// this.getColCell({x:colA, y:rowA})
			// , this.getColCell({x:colA, y:rowB})
			// , this.getColCell({x:colA, y:rowC})
			// , this.getColCell({x:colA, y:rowD})
			// , this.getColCell({x:colA, y:rowE})

			// , this.getColCell({x:colB, y:rowA})
			this.getColCell({x:colB, y:rowB})
			, this.getColCell({x:colB, y:rowC})
			, this.getColCell({x:colB, y:rowD})
			// , this.getColCell({x:colB, y:rowE})

			// , this.getColCell({x:colC, y:rowA})
			, this.getColCell({x:colC, y:rowB})
			, this.getColCell({x:colC, y:rowC})
			, this.getColCell({x:colC, y:rowD})
			// , this.getColCell({x:colC, y:rowE})

			// , this.getColCell({x:colD, y:rowA})
			, this.getColCell({x:colD, y:rowB})
			, this.getColCell({x:colD, y:rowC})
			, this.getColCell({x:colD, y:rowD})
			// , this.getColCell({x:colD, y:rowE})

			// , this.getColCell({x:colE, y:rowA})
			// , this.getColCell({x:colE, y:rowB})
			// , this.getColCell({x:colE, y:rowC})
			// , this.getColCell({x:colE, y:rowD})
			// , this.getColCell({x:colE, y:rowE})
		]);

		return cache.filter(set=>set.size);
	}

	screenFilter(filterName)
	{
		this.args.screenFilter = filterName;
	}

	reset()
	{
		this[Run]++;

		this.stop();

		this.clearDialog();
		this.hideDialog();

		this.tileMap.replacements.clear();
		this.tileMap.tileSetCache.clear();
		this.tileMap.tileCache.clear();

		this.callFrames.clear();
		this.callIntervals.clear();
		this.collisions.clear();
		this.colCellCache.clear();
		this.colCells.clear();
		this.regions.clear();
		this.spawn.clear();
		this.auras.clear();

		this.updateStarted.clear();
		this.updateEnded.clear();
		this.updated.clear();

		this.objectDb.clear()

		this.args.actClear = false;
		this.args.cutScene = false;
		this.args.fade = false;

		const layers = this.tileMap.tileLayers;

		for(const layerDef of layers)
		{
			layerDef.offsetX = 0;
			layerDef.offsetY = 0;
			layerDef.offsetXChanged = 0;
			layerDef.offsetYChanged = 0;
		}

		for(const layer of [...this.args.layers, ...this.args.fgLayers])
		{
			layer.args.destroyed = false;

			layer.args.offsetX = 0;
			layer.args.offsetY = 0;

			layer.args.offsetXChanged = 0;
			layer.args.offsetYChanged = 0;
		}

		for(const actor of this.actors.items())
		{
			this.actors.remove(actor);
		}

		this.controlActor && this.actors.remove(this.controlActor);
		this.nextControl = null;

		this.actorsById = {};

		for(const effect of this.effects.list)
		{
			effect && this.effects.remove(effect);
		}

		for(const particle of this.particles.list)
		{
			particle && this.particles.remove(particle);
		}

		this.spawn.clear();
		this[ActorPointCache].clear();

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.args.populated = false;
		this.controlActor   = null;
		// this.args.frameId   = -1;

		this.tags.viewport.focus();

		this.args.paused = true;
	}

	quit()
	{
		this.args.actClear = false;
		this.args.cutScene = false;
		this.args.fade = false;

		this.callFrames.clear();
		this.callIntervals.clear();
		this.collisions.clear();
		this.colCellCache.clear();
		this.colCells.clear();
		this.regions.clear();
		this.spawn.clear();
		this.auras.clear();

		this.args.timeBonus.args.value  = 0;
		this.args.ringBonus.args.value  = 0;
		this.args.speedBonus.args.value = 0;
		this.args.totalBonus.args.value = 0;

		this.meta = {};

		for(const actor of this.actors.items())
		{
			this.actors.remove(actor);
		}

		for(const layer of [...this.args.layers, ...this.args.fgLayers])
		{
			layer.args.destroyed = false;
		}

		this.willDetach.clear();

		this.objectDb.clear();

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.playableIterator = false;

		this.args.populated = false;
		this.args.paused    = false;
		this.args.started   = false;
		this.controlActor   = null;
		this.args.frameId   = -1;

		this.args.timer.args.value = '';
		this.args.rings.args.value  = 0;
		// this.emeralds.args.value = 0;
		// this.coins.args.value    = 0;

		this.args.hasRings    = false;
		this.args.hasCoins    = false;
		this.args.hasEmeralds = false;

		this.args.char.args.value = '';
		this.args.charName        = '';

		this.args.level = false;

		const layers = this.args.layers;
		const layerCount = layers.length;

		for(const layer of this.args.layers)
		{
			layer.remove();
		}

		for(const layer of this.args.fgLayers)
		{
			layer.remove();
		}

		const cards = [];

		cards.push(...this.returnHomeCards());

		this.args.titlecard = new Series({cards}, this);

		this.onTimeout(750, () => this.args.backdrop = null);

		this.args.titlecard.play();

		this.controller.zero();
	}

	introCards()
	{
		return [
			new LoadingCard({timeout: 3500, text: 'loading'}, this)
			, new BootCard({timeout: 3500})
			, new DebianCard({timeout: 4500})
			, new WebkitCard({timeout: 3500})
			, new GamepadCard({timeout: 2500})
			, new SeanCard({timeout: 5000}, this)
			, ...this.homeCards()
		]
	}

	homeCards()
	{
		return  [
			new TitleScreenCard({timeout: 51000}, this)
			, new MainMenu({timeout: -1}, this)
		];
	}

	returnHomeCards()
	{
		return  [
			new ThankYouCard({timeout: 5000}, this)
			, ...this.homeCards()
		];
	}

	record()
	{
		this.args.demoIndicator = null;

		this.reset();

		this.args.frameId = 0;

		this.replayFrames.clear();

		this.args.isRecording  = true;
		this.args.isReplaying  = false;
		this.args.hasRecording = true;
		this.args.paused       = false

		this.startLevel();
	}

	playback()
	{
		this.args.demoIndicator = null;

		this.replayInputs = JSON.parse(localStorage.getItem('replay')) || [];

		this.reset();

		this.args.frameId = 0;

		this.args.isReplaying = true;
		this.args.isRecording = false;

		this.startLevel();

		this.args.paused = false;
	}

	stop()
	{
		this.args.isReplaying = false;
		this.args.isRecording = false;
		this.args.paused      = false;

		if(this.args.isRecording)
		{
			const replay = JSON.stringify([...this.replayInputs]);

			localStorage.setItem('replay', replay);
		}

		this.controlActor && this.controlActor.controller.zero();

		this.tags.viewport.focus();
	}

	focus()
	{
		this.tags.viewport && this.tags.viewport.focus();
	}

	getServer(refresh = false)
	{
		const rtcConfig = {
			iceServers: [
				// {urls: 'stun:stun1.l.google.com:19302'},
				// {urls: 'stun:stun2.l.google.com:19302'}
			]
		};

		const server = (!refresh && server) || new RtcServer(rtcConfig);

		const onOpen = event => {
			console.log('Connection opened!');
			this.args.chatBox  = new ChatBox({pipe: server});
			// const actors = this.actors.list;

			// if(actors[1])
			// {
			// 	actors[1].args.name = 'Player 2';
			// }

			this.args.playerId = 1;
		};

		const onMessage = event => {
			const actors = this.actors.list;

			if(actors[1])
			{
				const packet = JSON.parse(event.detail);
				const actor = actors[1];

				if(packet.frame)
				{
					if(packet.frame.frame > this.args.frameId)
					{
						this.args.frameId = packet.frame.frame;
					}

					if(packet.frame.input)
					{
						actor.controller.replay(packet.frame.input);
						actor.readInput();
					}

					if(packet.frame.args)
					{
						Object.assign(actor.args, packet.frame.args);
					}
				}

			}
		};

		this.listen(server, 'open', onOpen, {once:true});
		this.listen(server, 'message', onMessage);

		this.server = server;

		// console.log(server);

		return server;
	}

	getClient(refresh = false)
	{
		const rtcConfig = {
			iceServers: [
				// {urls: 'stun:stun1.l.google.com:19302'},
				// {urls: 'stun:stun2.l.google.com:19302'}
			]
		};

		const client = (!refresh && this.client) || new RtcClient(rtcConfig);

		const onOpen = event => {
			console.log('Connection opened!')
			// const actors = this.actors.list;
			this.args.chatBox = new ChatBox({pipe: client});
			// if(actors[0])
			// {
			// 	actors[0].args.name = 'Player 1';
			// }

			this.args.playerId = 2;

		};

		const onMessage = event => {
			const actors = this.actors.list;

			if(actors[0])
			{
				const packet = JSON.parse(event.detail);
				const actor = actors[0];

				if(packet.frame)
				{
					if(packet.frame.frame > this.args.frameId)
					{
						this.args.frameId = packet.frame.frame;
					}

					if(packet.frame.input)
					{
						actor.controller.replay(packet.frame.input);
						actor.readInput();
					}

					if(packet.frame.args)
					{
						Object.assign(actor.args, packet.frame.args);
					}
				}

			}
		};


		this.listen(client, 'open', onOpen, {once:true});
		this.listen(client, 'message', onMessage);

		this.client = client;

		// console.log(client);

		return client;
	}

	serializePlayer()
	{
		if(!this.controlActor || !this.controlActor.controller)
		{
			return {};
		}

		const frame = this.args.frameId;
		const input = this.controlActor.controller.serialize();
		const args  = {

			x: this.controlActor.args.x
			, y: this.controlActor.args.y

			, gSpeed: this.controlActor.args.gSpeed
			, xSpeed: this.controlActor.args.xSpeed
			, ySpeed: this.controlActor.args.ySpeed

			, direction: this.controlActor.args.direction
			, facing: this.controlActor.args.facing

			, falling: this.controlActor.args.falling
			, rolling: this.controlActor.args.rolling
			, jumping: this.controlActor.args.jumping
			, flying:  this.controlActor.args.flying
			, float:   this.controlActor.args.float
			, angle:   this.controlActor.args.angle
			, mode:    this.controlActor.args.mode

			, groundAngle: this.controlActor.args.groundAngle
		};

		return {frame, input, args};
	}

	onFrameOut(frames, callback)
	{
		if(frames <= 0)
		{
			callback();
			return;
		}

		const callFrame = this.args.frameId + frames;

		if(!this.callFrames.has(callFrame))
		{
			this.callFrames.set(callFrame, new Set);
		}

		const callbacks = this.callFrames.get(callFrame);

		callbacks.add(callback);

		return () => callbacks.delete(callback);
	}

	onFrameInterval(interval, callback)
	{
		if(frames <= 0)
		{
			return;
		}

		const callInterval = interval;

		if(!this.callIntervals.has(callInterval))
		{
			this.callIntervals.set(callInterval, new Set);
		}

		const callbacks = this.callIntervals.get(callInterval);

		callbacks.add(callback);

		return () => callbacks.delete(callback);
	}

	callFrameOuts()
	{
		for(let i = this.args.lastFrameId; i <= this.args.frameId; i++)
		{
			if(!this.callFrames.has(i))
			{
				continue;
			}

			const callbacks = this.callFrames.get(i);

			for(const callback of callbacks)
			{
				callback();
			}

			this.callFrames.delete(i);
		}
	}

	callFrameIntervals()
	{
		for(let i = this.args.lastFrameId; i <= this.args.frameId; i++)
		{
			for(const [interval, callbacks] of this.callIntervals)
			{
				if(i % interval === 0)
				{
					for(const callback of callbacks)
					{
						callback();
					}
				}
			}
		}
	}

	pauseGame()
	{
		this.focus();

		this.args.paused = -1;

		this.args.pauseMenu.focusFirst();

		this.onTimeout(6, ()=>{
			this.controller && this.controller.zero();
		});
	}

	unpauseGame()
	{
		this.onTimeout(15, ()=>{
			this.controller && this.controller.zero();
		});

		this.onTimeout(30, ()=>{
			this.focus();
		});

		this.onTimeout(60, ()=>{
			this.args.paused = false;
		});
	}

	mousemove(event)
	{
		this.args.mouse = 'moved';

		this.onTimeout(5000, () => {
			this.args.mouse = 'hide';
		});
	}

	hyphenate(string)
	{
		return String(string).replace(/\s/g, '-').toLowerCase();
	}

	storeCheckpoint(actorId, checkpointId)
	{
		if(!this.checkpoints[this.tileMap.mapUrl])
		{
			this.checkpoints[this.tileMap.mapUrl] = {};
		}

		const checkpointsByActor = this.checkpoints[this.tileMap.mapUrl];

		checkpointsByActor[actorId] = {checkpointId, frames: this.args.frameId - this.args.startFrameId};

		localStorage.setItem(
			`checkpoints:::${this.tileMap.mapUrl}`
			, JSON.stringify(this.checkpoints[this.tileMap.mapUrl])
		);
	}

	getCheckpoint(actorId)
	{
		if(!this.checkpoints[this.tileMap.mapUrl])
		{
			const checkpointSource = localStorage.getItem(`checkpoints:::${this.tileMap.mapUrl}`) || '{}';
			this.checkpoints[this.tileMap.mapUrl] = JSON.parse(checkpointSource) || {};
		}

		const checkpointsByActor = this.checkpoints[this.tileMap.mapUrl];
		const currentCheckpoint  = checkpointsByActor[actorId];

		return currentCheckpoint;
	}

	clearCheckpoints(actorId = null)
	{
		if(actorId === null)
		{
			actorId = this.controlActor.args.id;
		}

		if(!this.checkpoints[this.tileMap.mapUrl])
		{
			this.checkpoints[this.tileMap.mapUrl] = {};
		}

		const checkpointsByActor = this.checkpoints[this.tileMap.mapUrl];

		delete checkpointsByActor[actorId];

		localStorage.setItem(
			`checkpoints:::${this.tileMap.mapUrl}`
			, JSON.stringify(this.checkpoints[this.tileMap.mapUrl])
		);
	}

	showCenterMessage(message, color)
	{
		this.args.centerMessage = new CharacterString({value: message, color});
	}

	hideCenterMessage()
	{
		this.args.centerMessage = false;
	}

	showDialog(lines = [], classes = '')
	{
		this.args.dialog = true;

		this.clearDialog();

		lines = lines.map(t => new CharacterString({value: t}));

		let offset = 0;

		for(const line of lines)
		{
			line.offset = offset;

			offset += line.args.value.length;
		}

		this.args.dialogLines = lines;

		this.args.dialogClasses = classes;
	}

	hideDialog(message)
	{
		this.clearDialog();
		this.args.dialog = false;
	}

	clearDialog()
	{
		this.args.dialogLines = [];
	}

	clearAct(message)
	{
		console.log(message);

		this.args.actClearLabel.args.value = message;

		const speedBonus = Math.trunc(this.controlActor.args.clearSpeed * 10);
		const ringBonus  = this.controlActor.args.rings * 100;
		let   timeBonus  = 0;

		const time  = (this.args.frameId - this.args.startFrameId) / 60;
		const seconds = Math.trunc(Math.abs(time));

		if(seconds < 30)
		{
			timeBonus = 50000;
		}
		else if(seconds < 45)
		{
			timeBonus = 10000;
		}
		else if(seconds < 60)
		{
			timeBonus = 5000;
		}
		else if(seconds < 90)
		{
			timeBonus = 4000;
		}
		else if(seconds < 120)
		{
			timeBonus = 3000;
		}
		else if(seconds < 180)
		{
			timeBonus = 2000;
		}
		else if(seconds < 240)
		{
			timeBonus = 1000;
		}
		else
		{
			timeBonus = 500;
		}

		const totalBonus = timeBonus + ringBonus + speedBonus;

		this.controlActor.args.score += totalBonus;

		this.args.actClear = true;

		this.args.timeBonus.args.value  = 0;
		this.args.ringBonus.args.value  = 0;
		this.args.speedBonus.args.value = 0;
		this.args.totalBonus.args.value = 0;

		this.onFrameOut(45,  () => this.args.timeBonus.args.value  = timeBonus);
		this.onFrameOut(90,  () => this.args.ringBonus.args.value  = ringBonus);
		this.onFrameOut(135, () => this.args.speedBonus.args.value = speedBonus);
		this.onFrameOut(180, () => this.args.totalBonus.args.value = totalBonus);
		this.onFrameOut(420, () => this.args.actClear = false);
	}

	cpuDetect()
	{
		try{
			ga('send', 'event', {
				eventCategory: 'cpu',
				eventAction:   'cores',
				eventLabel:    `core check`,
				eventValue:    navigator.hardwareConcurrency
			});
		}
		catch (error) {
			ga && ga('send', 'event', {
				eventCategory: 'cpu',
				eventAction:   'core check fail',
				eventLabel:    `Cpu Detect Failure: ${error}`
			});
		}
	}

	gpuDetect()
	{
		try{
			this.gpuDetector = this.gpuDetector || document.createElement('canvas').getContext('webgl');

			const debug  = this.gpuDetector.getExtension('WEBGL_debug_renderer_info');
			const vendor = this.gpuDetector.getParameter(debug.UNMASKED_VENDOR_WEBGL);
			const gpu    = this.gpuDetector.getParameter(debug.UNMASKED_RENDERER_WEBGL);

			ga('send', 'event', {
				eventCategory: 'gpu',
				eventAction:   vendor,
				eventLabel:    gpu
			});
		}
		catch (error) {
			ga && ga('send', 'event', {
				eventCategory: 'gpu',
				eventAction:   'fail',
				eventLabel:    `Gpu Detect Failure: ${error}`
			});
		}
	}

	buildDetect()
	{
		const buildTag = document.head.querySelector('meta[name="x-build-time"]');

		const build = buildTag.getAttribute('content');

		ga && ga('send', 'event', {
			eventCategory: 'build',
			eventAction:   'build check',
			eventLabel:    build
		});
	}
}
