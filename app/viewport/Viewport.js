import { Bindable } from 'curvature/base/Bindable';
import { Bag  }     from 'curvature/base/Bag';
import { Tag  }     from 'curvature/base/Tag';
import { View }     from 'curvature/base/View';
import { Router }   from 'curvature/base/Router';
import { Keyboard } from 'curvature/input/Keyboard';

import { TileMap }  from '../tileMap/TileMap';

import { Titlecard } from '../titlecard/Titlecard';

import { Particle3d } from '../particle/Particle3d';

import { MarbleGarden as Backdrop } from '../backdrop/MarbleGarden';
import { ProtoLabrynth } from  '../backdrop/ProtoLabrynth';
import { MysticCave } from  '../backdrop/MysticCave';

import { Series }   from '../intro/Series';
import { Card }     from '../intro/Card';

import { TitleScreenCard } from '../intro/TitleScreenCard';
import { LoadingCard } from '../intro/LoadingCard';
import { BootCard } from    '../intro/BootCard';
import { DebianCard } from '../intro/DebianCard';
import { WebkitCard } from '../intro/WebkitCard';
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

const ColCellsNear = Symbol('collision-cells-near');
const ColCell = Symbol('collision-cell');

export class Viewport extends View
{
	secretSample = new Audio('/doom/dssecret.wav');
	secretsFound = new Set;
	template     = require('./viewport.html');

	constructor(args,parent)
	{
		super(args,parent);

		this[ Bindable.NoGetters ] = true;

		Router.listen(this, { '': () => '' });

		this.args.screenEffects = [];

		this.meta = {};

		this.objectPalette = ObjectPalette;

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

		let  mapUrl = '/map/pixel-hill-zone.json';
		const inputMapUrl = Router.query.map;

		let noMenu = false;

		if(inputMapUrl && inputMapUrl.match(/^\w/))
		{
			mapUrl = '/map/' + inputMapUrl;

			noMenu = true;
		}

		this.args.startFrameId = 0;

		this.tileMap = new TileMap({ mapUrl });
		this.sprites = new Bag;
		this.world   = null;

		const ready = this.tileMap.ready;

		let noIntro = Router.query.nointro;

		const cards = [];

		if(noMenu)
		{
			noIntro = true;

			cards.push(this.args.zonecard = new Titlecard({}, this));

			this.tileMap.ready.then(() => {
				this.setZoneCard();
				this.args.zonecard.play().then(()=>{
					this.startLevel();
				})
			});
		}
		else if(!noIntro)
		{
			cards.push(...this.introCards());
		}
		else
		{
			this.args.zonecard = new Titlecard({waitFor: this.tileMap.ready}, this);

			cards.push(new MainMenu({timeout: -1}, this), this.args.zonecard);
		}

		this.args.noIntro = noIntro ? 'no-intro' : '';

		this.args.titlecard = new Series({cards}, this);

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

		this.args.topLine = new CharacterString({value:'', scale: 2});
		this.args.status  = new CharacterString({value:'', scale: 2});
		this.args.focusMe = new CharacterString({value:'', scale: 2});

		this.args.labelChar = new CharacterString({value:'Char: '});

		this.args.labelX = new CharacterString({value:'x pos: '});
		this.args.labelY = new CharacterString({value:'y pos: '});

		this.args.labelGround = new CharacterString({value:'Grounded: '});
		this.args.labelCamera = new CharacterString({value:'Camera: '});
		this.args.labelAngle  = new CharacterString({value:'Gnd theta: '});
		this.args.labelGSpeed = new CharacterString({value:'Gnd spd: '});
		this.args.labelXSpeed = new CharacterString({value:'X air spd: '});
		this.args.labelYSpeed = new CharacterString({value:'Y air spd: '});
		this.args.labelMode   = new CharacterString({value:'Mode: '});
		this.args.labelFrame  = new CharacterString({value:'Frame ID: '});
		this.args.labelFps    = new CharacterString({value:'FPS: '});

		this.args.labelAirAngle  = new CharacterString({value:'Air theta: '});

		this.args.char   = new CharacterString({value:'...'});

		this.args.xPos   = new CharacterString({value:0});
		this.args.yPos   = new CharacterString({value:0});
		this.args.gSpeed = new CharacterString({value:0, high: 199, med: 99, low: 49});
		this.args.ground = new CharacterString({value:''});
		this.args.xSpeed = new CharacterString({value:0});
		this.args.ySpeed = new CharacterString({value:0});
		this.args.mode   = new CharacterString({value:0});
		this.args.angle  = new CharacterString({value:0});

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

		this.colCellDiv = this.args.width > this.args.height
			? this.args.width * 0.75
			: this.args.height * 0.75;

		this.colCellCache = new Map;
		this.colCells = new Map;

		this.actorPointCache = new Map;

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

		// this.replayInputs = JSON.parse(localStorage.getItem('replay')) || [];

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

	fullscreen()
	{
		if(document.fullscreenElement)
		{
			document.exitFullscreen();
			this.showStatus(3000, ' hit escape to revert. ');
			this.showStatus(0, '');
			this.args.focusMe.args.hide = '';
			this.args.fullscreen = '';
			return;
		}

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

		this.onTimeout(100, () => this.fitScale(false));

		this.onTimeout(21500, () => {
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

		this.args.titlecard.play();

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
	}

	startLevel()
	{
		this.setZoneCard();
		this.args.fade = false;

		this.args.startFrameId = this.args.frameId;

		if(!this.args.backdrop)
		{
			this.fillBackground();
		}

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

			const storedPosition = this.getCheckpoint(this.nextControl.args.id);
			const checkpoint = storedPosition ? this.actorsById[storedPosition.checkpointId] : null;


			if(checkpoint)
			{
				this.args.startFrameId = this.args.frameId - storedPosition.frames;
				this.args.x = this.nextControl.args.x = checkpoint.x;
				this.args.y = this.nextControl.args.y = checkpoint.y;
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

		this.args.zonecard.played.then(() => {
			this.args.started = true;
			this.args.running = true;

			this.update();
			// this.update();

			this.args.level = 'level';

			this.args.running = false;

			if(typeof ga === 'function')
			{
				ga('send', 'event', {
					eventCategory: 'zone',
					eventAction: 'started',
					eventLabel: `${this.args.actName}`
				});
			}

			this.onTimeout(500, () => {
				this.startTime    = Date.now();
				this.args.running = true;
			});
		});
	}

	takeInput(controller)
	{
		const keyboard = Keyboard.get();

		keyboard.update();

		if(!this.gamepad)
		{
			controller.readInput({keyboard});
		}
		else
		{
			const gamepads = navigator.getGamepads();

			for(let i = 0; i < gamepads.length; i++)
			{
				const gamepad = gamepads.item(i);

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

		if(controller.buttons[1011] && controller.buttons[1011].time === 1)
		{
			this.fullscreen();
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
				this.args.currentSheild = this.controlActor.public.currentSheild
					? this.controlActor.public.currentSheild.type
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

				// if(this.args.paused)
				// {
				// 	return;
				// }
				// else
				// {
				// }

			}

			if(this.controlActor && this.args.isRecording)
			{
				const frame = this.args.frameId;
				const input = controller.serialize();
				const args  = {
					[this.controlActor.public.id]: {
						x: this.controlActor.public.x
						, y: this.controlActor.public.y
						, gSpeed: this.controlActor.public.gSpeed
						, xSpeed: this.controlActor.public.xSpeed
						, ySpeed: this.controlActor.public.ySpeed
					}
				};

				this.replayInputs.push({frame, input, args});
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
			this.cameraBound -= 0.0005;
		}

		let cameraSpeed = 30;

		const actor     = this.controlActor;

		const highJump  = actor.public.highJump;
		const deepJump  = actor.public.deepJump;
		const falling   = actor.public.falling;
		const fallSpeed = actor.public.ySpeed;

		if(actor.public.jumping)
		{
			this.maxCameraBound = 24;

			if(deepJump || highJump)
			{
				this.maxCameraBound = 12;
			}
		}
		else
		{
			this.maxCameraBound = 64;
		}

		switch(this.controlActor.args.cameraMode)
		{
			case 'airplane': {
				const xSpeed     = this.controlActor.args.standingOn && this.controlActor.args.standingOn.public.xSpeed;
				const absSpeed   = Math.abs(xSpeed);
				const shiftSpeed = 5;

				cameraSpeed = 10;

				const speedBias = Math.min(absSpeed / 40, 0.0001) * -Math.sign(xSpeed);

				this.args.xOffsetTarget = 0.5 + speedBias * 0.5;
				this.args.yOffsetTarget = 0.5;
				break;

			}

			case 'railcar-aerial':
			case 'railcar-normal':
				this.args.xOffsetTarget = 0.5;
				this.args.yOffsetTarget = 0.5;
				this.maxCameraBound = 0;
				cameraSpeed = 0;

				break;

			case 'aerial':

				this.args.xOffsetTarget = 0.5;

				if(!actor.public.flying && (deepJump || highJump) && fallSpeed > 0)
				{
					this.args.yOffsetTarget = 0.1;
				}
				else if(!actor.public.flying && (deepJump || highJump) && fallSpeed < 0)
				{
					this.args.yOffsetTarget = 0.9;
				}
				else
				{
					this.args.yOffsetTarget = 0.5;
				}

				cameraSpeed = 30;

				break;

			case 'cinematic':

				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.50;
				this.maxCameraBound     = 1;
				cameraSpeed = 0;

				break;

			case 'cliff':

				this.args.xOffsetTarget = 0.50 + -0.02 * this.controlActor.public.direction;
				this.args.yOffsetTarget = 0.45;

				cameraSpeed = 30;

				break;

			case 'bridge':

				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.65;

				cameraSpeed = 30;

				break;

			case 'boss':

				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.80;
				this.maxCameraBound     = 1;

				cameraSpeed = 5;

				break;

			default:

				this.args.xOffsetTarget = 0.5;
				this.args.yOffsetTarget = 0.5;

				cameraSpeed = 25;

			break;
		}

		if(['normal', 'bridge', 'aerial'].includes(this.controlActor.args.cameraMode))
		{
			const gSpeed     = this.controlActor.public.gSpeed;
			const absSpeed   = Math.abs(gSpeed);
			const shiftSpeed = 15;
			const speedBias = Math.min(absSpeed / 25, 1) * -Math.sign(gSpeed);

			switch(this.controlActor.public.mode)
			{
				case 0:
					this.args.xOffsetTarget = 0.5 + speedBias * 0.35;
					this.args.yOffsetTarget = 0.6;
					break;

				case 1:
					this.args.xOffsetTarget = 0.25;
					this.args.yOffsetTarget = 0.50 + speedBias * 0.35;
					break;

				case 2:
					this.args.xOffsetTarget = 0.5 - speedBias * 0.35;
					this.args.yOffsetTarget = 0.3;
					break;

				case 3:
					this.args.xOffsetTarget = 0.75;
					this.args.yOffsetTarget = 0.50 - speedBias * 0.35;
					break;
			}
		}

		this.args.yOffsetTarget += this.controlActor.args.cameraBias;

		if(this.controlActor.args.cameraBias)
		{
			cameraSpeed = 15;
			cameraSpeed = 15;
		}

		if(cameraSpeed)
		{
			const offsetDiff = this.args.yOffsetTarget - this.args.yOffset;

			this.args.yOffset += offsetDiff / cameraSpeed;
		}
		else
		{
			this.args.yOffset = this.args.yOffsetTarget;
		}

		if(cameraSpeed)
		{
			const offsetDiff = this.args.xOffsetTarget - this.args.xOffset;

			this.args.xOffset += offsetDiff / cameraSpeed;
		}
		else
		{
			this.args.xOffset = this.args.xOffsetTarget;
		}

		const center = actor.rotatePoint(0, -actor.public.height / 2);

		const xNext = -actor.x + center[0] + this.args.width  * this.args.xOffset;
		const yNext = -actor.y + center[1] + this.args.height * this.args.yOffset;

		const yDiff = this.args.y - yNext;
		const xDiff = this.args.x - xNext;

		const distance = Math.sqrt(xDiff ** 2 + yDiff ** 2);
		const angle    = Math.atan2(yDiff, xDiff);

		const maxDistance = this.cameraBound;

		const dragDistance = Math.min(maxDistance, distance);

		const snapFactor = Math.abs(dragDistance / maxDistance);
		const snapFrames = 24;
		const snapSpeed  = dragDistance / snapFrames;

		let x = xNext + dragDistance * Math.cos(angle)
		let y = yNext + dragDistance * Math.sin(angle);

		x = x - snapFactor * Math.cos(angle) * snapSpeed;
		y = y - snapFactor * Math.sin(angle) * snapSpeed;

		if(x > 96 && !this.meta.wrapX)
		{
			x = 96;
		}

		if(y > 96)
		{
			y = 96;
		}

		const xMax = -(this.tileMap.mapData.width * 32) + this.args.width - 96;
		const yMax = -(this.tileMap.mapData.height * 32) + this.args.height - 96;

		if(x < xMax && !this.meta.wrapX)
		{
			x = xMax;
		}

		if(y < yMax)
		{
			y = yMax;
		}

		this.args.shakeX *= -0.99;
		this.args.shakeY *= -0.99;

		this.args.x = x + this.args.shakeX;
		this.args.y = y + this.args.shakeY;
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

		for(const layer of [...this.args.layers, ...this.args.fgLayers])
		{
			const xDir = Math.sign(layer.x - this.args.x);
			const yDir = Math.sign(layer.y - this.args.y);

			layer.x = this.args.x;
			layer.y = this.args.y;

			layer.update(this.tileMap, xDir, yDir);
		}

		this.tileMap.ready.then(()=>{
			const xMax = -(this.tileMap.mapData.width * 32);
			const yMax = -(this.tileMap.mapData.height * 32);

			for(const [,backdrop] of this.backdrops)
			{
				if(!backdrop.view)
				{
					let backdropType = '';

					for(const property of backdrop.properties)
					{
						if(property.name === 'backdrop')
						{
							backdropType = property.value;
						}
					}

					if(backdropType === 'protolabrynth')
					{
						backdrop.view = new ProtoLabrynth;

						backdrop.view.render( this.tags.backdrops );
					}
					else if(backdropType === 'mystic-cave')
					{
						backdrop.view = new MysticCave;

						backdrop.view.render( this.tags.backdrops );
					}
				}

				const leftIntersect   = this.args.width  + -this.args.x + -backdrop.x;
				const rightIntersect  = -(-backdrop.width + -this.args.x + -backdrop.x);
				const topIntersect    = this.args.height + -this.args.y + -backdrop.y;
				const bottomIntersect = -(-backdrop.height + -this.args.y + -backdrop.y);

				backdrop.view && Object.assign(backdrop.view.args, ({
					x: this.args.x
					, xMax: xMax
					, y: this.args.y + backdrop.y
					, yMax: this.args.y + backdrop.y + -backdrop.view.stacked
					, stacked: -backdrop.view.stacked + 'px'
					, frame: this.args.frameId
					, top: topIntersect
					, bottom: bottomIntersect
				}));
			}

			this.args.backdrop && Object.assign(this.args.backdrop.args, ({
				x: this.args.x
				, y: this.args.y
				, xMax: xMax
				, yMax: yMax
				, frame: this.args.frameId
				, stacked: -this.args.backdrop.stacked + 'px'
			}));
		});

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
			'--width': this.args.width
			, '--height': this.args.height
			, '--scale': this.args.scale
		});
	}

	populateMap()
	{
		if(this.args.populated)
		{
			return;
		}

		this.args.populated = true;

		const objDefs = this.tileMap.getObjectDefs();

		this.objDefs = new Map;

		for(const [id,backdrop] of this.backdrops)
		{
			if(backdrop.view)
			{
				backdrop.view.remove();
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

			rawActor[ Bindable.NoGetters ] = true;

			const actor = Bindable.make(rawActor);

			this.actors.add( actor );

			if(actor instanceof Region)
			{
				actor.render(this.tags.actors);
			}
			else
			{
				actor.render(this.tags.actors);
			}

			actor.onRendered();

			if(actor.onAttach && actor.onAttach() === false)
			{
				actor.detach();
			}

			if(this.actorIsOnScreen(actor))
			{
				actor.args.display = 'initial';
			}
			else
			{
				actor.args.display = 'none';
				actor.detach();
			}

			if(actor.controllable)
			{
				actor.name = objDef.name;

				// this.auras.add( actor );

				actor.args.display = 'initial';
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

	actorIsOnScreen(actor, margin = 256)
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
		const actorLeft  = actor.x - actorWidth / 2;
		const actorRight = actor.x + actorWidth + actorWidth / 2;

		if((camLeft < actorRight && camRight > actorLeft)
			&& camTop < actor.y && camBottom > actorTop
		){
			return true;
		}
		else if((actorLeft < camRight && actorRight > camLeft)
			&& actorTop < camBottom && actor.y > camTop
		){
			return true;
		}
		else
		{
			return false;
		}
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

		// for(const i in nearbyCells)
		// {
		// 	const cell   = nearbyCells[i];
		// 	const actors = cell;

		// 	for(const actor of actors)
		// 	{

		// 	}
		// }
	}

	actorUpdate(actor)
	{
		if(this.updated.has(actor))
		{
			return;
		}

		this.updated.add(actor);

		actor.update();

		// for(const i in nearbyCells)
		// {
		// 	const cell   = nearbyCells[i];
		// 	const actors = cell;

		// 	for(const actor of actors)
		// 	{
		// 	}
		// }
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
		// for(const i in nearbyCells)
		// {
		// 	const cell   = nearbyCells[i];
		// 	const actors = cell;

		// 	for(const actor of actors)
		// 	{
		// 	}
		// }
	}

	nearbyActors(actor)
	{
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
				result.add(actor);
			}
		}

		return result;
	}

	update()
	{
		for(const layer of [...this.args.layers, ...this.args.fgLayers])
		{
			const xDir = Math.sign(layer.x - this.args.x);
			const yDir = Math.sign(layer.y - this.args.y);

			layer.x = this.args.x;
			layer.y = this.args.y;

			layer.move(this.tileMap, xDir, yDir);
		}

		const controller = this.controlActor
			? this.controlActor.controller
			: this.controller;

		if(!this.args.paused || this.args.networked)
		{
			this.callFrameOuts();
			this.callFrameIntervals();

			this.args.frameId++;
		}

		if(this.args.frameId % 600 === 0)
		{
			ga('set', 'metric1', this.args.frameId / 60);

			ga('send', 'event', {
				eventCategory: 'fps-check',
				eventAction: 'fps-check',
				eventLabel: `${this.args.actName}`,
				eventValue: Math.trunc(this.args.fps)
			});
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

			return;
		}

		if(this.args.paused !== false && !this.args.networked)
		{
			this.takeInput(controller);

			this.args.pauseMenu.input(controller);

			if(this.args.paused > 0)
			{
				this.args.paused--;
			}
			else
			{
				return;
			}
		}

		if(this.args.frameId % 15 === 0)
		{
			for(const [detachee, detacher] of this.willDetach)
			{
				this.willDetach.delete(detachee);

				detacher();
			}
		}

		if(!Number(this.args.rings.args.value))
		{
			this.args.ringLabel.args.color = 'red';
		}
		else
		{
			this.args.ringLabel.args.color = 'yellow';
		}

		this.args.fpsSprite.args.value = Number(this.args.fps).toFixed(2);
		this.args.frame.args.value = this.args.frameId;

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

		this.actorPointCache.clear();

		if(this.controlActor)
		{
			if(this.args.isReplaying)
			{
				this.args.focusMe.args.hide = 'hide';

				const replay = this.replayInputs[this.args.frameId];

				if(replay && replay.actors)
				{
					for(const actorId in replay.actors)
					{
						const actor = this.actorsById[actorId];
						const frame = replay.actors[actorId];

						if(frame.input)
						{
							actor.controller.replay(frame.input);
							actor.readInput();
						}

						if(frame.args)
						{
							Object.assign(actor.args, frame.args);
						}
					}

					if(this.replayInputs.length)
					{
						this.args.hasRecording = true;
						this.args.topLine.args.value = ' i cant believe its not canvas. ';
						this.args.status.args.value = ' click here to exit demo. ';
					}
				}
				else
				{
					this.args.isReplaying = false;
				}
			}
			else
			{
				if(this.gamepad)
				{
					this.args.focusMe.args.hide = 'hide';
				}

				if(!this.args.cutScene)
				{
					this.controlActor.controller && this.takeInput(this.controlActor.controller);
					this.controlActor.readInput();
				}
			}
		}

		this.updateStarted.clear();
		this.updated.clear();
		this.updateEnded.clear();

		if(this.args.running)
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

				const nearbyCells = this.getNearbyColCells(actor);

				for(const cell of nearbyCells)
				{
					for(const actor of cell)
					{
						if(actor !== this.controlActor)
						{
							updatable.add(actor);
						}
					}
				}
			}

			for(const actor of updatable)
			{
				this.actorUpdateStart(actor);
			}

			if(this.controlActor)
			{
				this.actorUpdateStart(this.controlActor);
			}

			for(const actor of updatable)
			{
				this.actorUpdate(actor);
			}

			if(this.controlActor)
			{
				this.actorUpdate(this.controlActor);
			}

			for(const actor of updatable)
			{
				this.actorUpdateEnd(actor);
			}

			if(this.controlActor)
			{
				this.actorUpdateEnd(this.controlActor);
			}

			for(const actor of updatable)
			{
				this.setColCell(actor);
			}

			if(this.controlActor)
			{
				this.setColCell(this.controlActor);
			}

			if(this.collisions)
			{
				for(const [collider, collidees] of this.collisions)
				{
					for(const collidee of collidees)
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
				// this.emeralds.args.value = `${this.controlActor.args.emeralds}/7`;

				this.args.hasRings    = !!this.controlActor.args.rings;
				this.args.hasEmeralds = !!this.controlActor.args.emeralds;
				this.args.char.args.value = this.controlActor.args.name;
				this.args.charName        = this.controlActor.args.name;

				if(this.args.debugOsd)
				{
					// this.coins.args.value = this.controlActor.args.coins;
					// this.args.hasCoins    = !!this.controlActor.args.coins;

					this.args.xPos.args.value     = Number(this.controlActor.x).toFixed(3);
					this.args.yPos.args.value     = Number(this.controlActor.y).toFixed(3);

					this.args.ground.args.value   = this.controlActor.args.landed;
					this.args.gSpeed.args.value   = Number(this.controlActor.args.gSpeed).toFixed(3);

					this.args.xSpeed.args.value   = Number(this.controlActor.args.xSpeed).toFixed(3);
					this.args.ySpeed.args.value   = Number(this.controlActor.args.ySpeed).toFixed(3);

					this.args.angle.args.value    = (Math.round((this.controlActor.args.groundAngle) * 1000) / 1000).toFixed(3);
					this.args.airAngle.args.value = (Math.round((this.controlActor.args.airAngle) * 1000) / 1000).toFixed(3);

					const modes = ['FLOOR', 'L-WALL', 'CEILING', 'R-WALL'];

					this.args.mode.args.value = modes[Math.floor(this.controlActor.args.mode)] || Math.floor(this.controlActor.args.mode);
					this.args.cameraMode.args.value = this.controlActor.args.cameraMode;
				}
			}
		}

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
					const actorIsOnScreen = this.actorIsOnScreen(actor);

					if(actorIsOnScreen && !(actor instanceof LayerSwitch))
					{
						actor.args.display = 'initial';

						if(!actor.vizi)
						{
							if(!actor.public.hidden)
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
				&& this.controlActor.sprite.parentNode
				&& this.controlActor.sprite.parentNode.classList.remove('actor-selected');

			if(this.controlActor)
			{
				this.controlActor.selected = false;
			}

			this.controlActor = this.nextControl;

			this.controlActor.selected = true;

			this.controlActor.sprite.parentNode.classList.add('actor-selected');

			this.auras.add(this.controlActor);

			this.controlActor.args.display = 'initial';

			this.controlActor.nodes.map(n => this.tags.actors.append(n));

			this.controlActor.vizi = true;

			this.args.maxSpeed = null;
			this.nextControl   = null;
		}

		this.updateBackground();

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

		this.collisions = new Map;
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
			const regionArgs = region.public;

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
		const cacheKey = x + '::' + y;
		const actorPointCache = this.actorPointCache;

		if(actorPointCache.has(cacheKey))
		{
			return actorPointCache.get(cacheKey);
		}

		const actors = [];

		for(const cell of this.getNearbyColCells({x,y}))
		{
			for(const actor of cell)
			{
				// if(actor.removed)
				// {
				// 	continue;
				// }

				const actorArgs = actor.public;

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

				const otherLeft   = actorX - offset;
				const otherRight  = actorX + offset;
				const otherTop    = actorY - height;
				const otherBottom = actorY;

				if(myRight >= otherLeft && otherRight > myLeft)
				{
					if(otherBottom >= myTop && myBottom > otherTop)
					{
						actors.push( actor );
					}
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

		ga('send', 'event', {
			eventCategory: 'gamepad',
			eventAction: 'disconnected',
			eventLabel: event.gamepad.id
		});
	}

	getColCell(actor)
	{
		const colCellDiv = this.colCellDiv;
		const colCells   = this.colCells;

		const cellX = Math.floor( actor.x / colCellDiv );
		const cellY = Math.floor( actor.y / colCellDiv );

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

	setColCell(actor)
	{
		actor[ Bindable.NoGetters ] = true;

		actor = Bindable.make(actor);

		const cell = this.getColCell(actor);

		const originalCell = actor[ColCell];

		if(originalCell && originalCell !== cell)
		{
			originalCell.delete(actor);
		}

		actor[ColCell] = cell;

		actor[ColCell].add(actor);

		return cell;
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
		this.tileMap.replacements.clear();
		this.tileMap.tileSetCache.clear();
		this.tileMap.tileCache.clear();

		this.args.actClear = false;
		this.args.cutScene = false;
		this.args.fade = false;

		this.stop();

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

		for(const i in this.actors.list)
		{
			const actor = this.actors.list[i];

			this.actors.remove(actor);
		}

		this.controlActor && this.actors.remove(this.controlActor);

		this.callFrames.clear();
		this.callIntervals.clear();
		this.collisions.clear();
		this.colCellCache.clear();
		this.colCells.clear();
		this.regions.clear();
		this.spawn.clear();
		this.auras.clear();

		for(const effect of this.effects.list)
		{
			effect && this.effects.remove(effect);
		}

		for(const particle of this.particles.list)
		{
			particle && this.particles.remove(particle);
		}

		this.spawn.clear();
		this.actorPointCache.clear();

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.args.populated = false;
		this.controlActor   = null;
		// this.args.frameId   = -1;

		this.tags.viewport.focus();
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


		for(const i in this.actors.list)
		{
			const actor = this.actors.list[i];

			this.actors.remove(actor);
		}

		for(const layer of [...this.args.layers, ...this.args.fgLayers])
		{
			layer.args.destroyed = false;
		}

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

		cards.push(...this.homeCards());

		this.args.titlecard = new Series({cards}, this);

		this.args.backdrop = null;

		this.args.titlecard.play();
	}

	introCards()
	{
		return [
			new LoadingCard({timeout: 350, text: 'loading'}, this)
			, new BootCard({timeout: 3500})
			, new DebianCard({timeout: 4500})
			, new WebkitCard({timeout: 5500})
			, new SeanCard({timeout: 5000}, this)
			, ...this.homeCards()
		]
	}

	homeCards()
	{
		const titlecard = this.args.zonecard = new Titlecard({}, this);

		return  [
			new TitleScreenCard({timeout: 50000}, this)
			, new MainMenu({timeout: -1}, this)
			, titlecard
		];
	}

	record()
	{
		this.reset();

		this.replayInputs = [];

		this.args.isRecording  = true;
		this.args.hasRecording = true;
	}

	playback()
	{
		this.reset();

		this.args.isReplaying = true;
	}

	stop()
	{
		this.args.isReplaying = false;

		if(this.args.isRecording)
		{
			const replay = JSON.stringify([...this.replayInputs]);

			localStorage.setItem('replay', replay);
		}

		this.args.isRecording = false;

		this.controlActor && this.controlActor.controller.zero();
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
		const frame = this.args.frameId;
		const input = this.controlActor.controller.serialize();
		const args  = {

			x: this.controlActor.public.x
			, y: this.controlActor.public.y

			, gSpeed: this.controlActor.public.gSpeed
			, xSpeed: this.controlActor.public.xSpeed
			, ySpeed: this.controlActor.public.ySpeed

			, direction: this.controlActor.public.direction
			, facing: this.controlActor.public.facing

			, falling: this.controlActor.public.falling
			, rolling: this.controlActor.public.rolling
			, jumping: this.controlActor.public.jumping
			, flying:  this.controlActor.public.flying
			, float:   this.controlActor.public.float
			, angle:   this.controlActor.public.angle
			, mode:    this.controlActor.public.mode

			, groundAngle: this.controlActor.public.groundAngle
		};

		return {frame, input, args};
	}

	onFrameOut(frames, callback)
	{
		if(frames <= 0)
		{
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
		if(!this.callFrames.has(this.args.frameId))
		{
			return;
		}

		const callbacks = this.callFrames.get(this.args.frameId);

		for(const callback of callbacks)
		{
			callback();
		}

		this.callFrames.delete(this.args.frameId);
	}

	callFrameIntervals()
	{
		for(const [interval, callbacks] of this.callIntervals)
		{
			if(this.args.frameId % interval === 0)
			{
				for(const callback of callbacks)
				{
					callback();
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

	clearCheckpoints(actorId)
	{
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
}
