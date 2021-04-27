import { Bindable } from 'curvature/base/Bindable';
import { Bag  }     from 'curvature/base/Bag';
import { Tag  }     from 'curvature/base/Tag';
import { View }     from 'curvature/base/View';
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
import { SeanCard } from    '../intro/SeanCard';
import { PauseMenu } from   '../Menu/PauseMenu.js';
import { MainMenu } from    '../Menu/MainMenu.js';

import { LayerSwitch } from '../actor/LayerSwitch';
import { Region } from '../region/Region';

import { CharacterString } from '../ui/CharacterString';
import { HudFrame } from '../ui/HudFrame';

import { Layer } from './Layer';

import { Controller } from '../controller/Controller';

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

		this.objectPalette = ObjectPalette;

		this.callFrames = new Map;
		this.backdrops  = new Map;

		this.willDetach = new Map;

		this.server = null;
		this.client = null;

		this.args.networked = false;

		this.args.mouse = 'moved';

		this.settings = {
			blur: false
			, displace: false
			, outline: 1
			, musicVol: 100
			, sfxVol: 100
			, username: 'player'
		};

		this.vizi = true;

		this.args.level = '';

		this.tileMap = new TileMap({ mapUrl: '/map/pixel-hill-zone.json' });
		this.sprites = new Bag;
		this.world   = null;

		const ready = this.tileMap.ready;

		this.args.titlecard = new Series({cards: this.introCards()}, this);

		this.args.pauseMenu = new PauseMenu({}, this);

		this.particles = new Bag;
		this.effects   = new Bag;

		this.maxCameraBound = 80;
		this.cameraBound = 80;

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
		this.args.labelAngle  = new CharacterString({value:'Gnd theta: '});
		this.args.labelGSpeed = new CharacterString({value:'speed: '});
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

		this.args.airAngle   = new CharacterString({value:0});

		this.args.nowPlaying = new CharacterString({value:'Now playing'});
		this.args.trackName  = new CharacterString({value:'Ice cap zone act 1 theme'});

		this.args.fpsSprite = new CharacterString({value:0});
		this.args.frame     = new CharacterString({value:0});

		this.rings = new CharacterString({value:0});
		this.coins = new CharacterString({value:0});
		this.emeralds = new CharacterString({value:'0/7'});

		this.args.emeralds = new HudFrame({value:this.emeralds, type: 'emerald-frame'});
		this.args.timer = new HudFrame({value:new CharacterString({value:'00:00.00'})});
		this.args.rings = new HudFrame({value:this.rings, type: 'ring-frame'});
		this.args.coins = new HudFrame({value:this.coins, type: 'coin-frame'});


		// this.args.bindTo('frameId', v => this.args.frame.args.value = Number(v) );
		this.args.frameId = -1;

		this.settings.bindTo('displace', v => this.args.displacement = v ? 'on' : 'off');
		this.settings.bindTo('outline',  v => this.args.outline  = v);

		for(const setting in this.settings)
		{
			const val = localStorage.getItem('sonic-3000-setting=' + setting);

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

			localStorage.setItem('sonic-3000-setting=' + k, JSON.stringify(v));

		});


		// this.controlCard = View.from(require('../cards/basic-controls.html'));
		// this.moveCard    = View.from(require('../cards/basic-moves.html'));

		this.args.blockSize = 32;

		this.args.populated = false;

		this.args.willStick = false;
		this.args.stayStuck = false;

		this.args.willStick = true;
		this.args.stayStuck = true;

		this.args.width  = 32 * 14;
		this.args.height = 32 * 8;
		this.args.scale  = 2;

		// this.args.width  = 32 * 14 * 2;
		// this.args.height = 32 * 8  * 2;
		// this.args.scale  = 1;

		this.collisions = new WeakMap;

		this.args.x = this.args.x || 0;
		this.args.y = this.args.y || 0;

		this.args.layers = [];

		this.args.animation = '';

		this.regions = new Set;
		this.spawn   = new Set;
		this.auras   = new Set;

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

				delete i.controllable[i.args.name];
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

		this.colCellCache = new Map;
		this.colCellDiv = this.args.width > this.args.height
			? this.args.width * 0.5
			: this.args.height * 0.5;

		this.colCells = new Map;

		this.actorPointCache = new Map;

		this.startTime = null;

		this.args.audio = true;

		this.nextControl = false;

		this.args.controllable = {};

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

	fitScale(fill = true)
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

		this.onTimeout(8800, () => {
			this.args.focusMe.args.value = ' Click here to enable keyboard control. ';
		});

		this.tags.blurDistance.setAttribute('style', `filter:url(#motionBlur)`);

		this.listen(this.tags.frame, 'click', (event) => {
			if(event.target === this.tags.frame.node)
			{
				this.tags.viewport.focus();
			}
		});

		this.listen(document, 'fullscreenchange', (event) => {
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

		if(window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches)
		{
			this.args.standalone = 'standalone';

			document.title = 'Sonic 3000'

			this.listen(window, 'resize', () => this.fitScale(false));
			this.onTimeout(100, () => this.fitScale(false));
		}

		this.onTimeout(100, () => this.args.initializing = '');
	}

	startLevel()
	{
		this.args.backdrop = new Backdrop;

		if(this.tileMap.mapData && this.tileMap.mapData.properties)
		{
			for(const property of this.tileMap.mapData.properties)
			{
				const name = property.name.replace(/-/g, '_');

				this.args[ name ] = property.value;
			}
		}

		this.args.zonecard.args.firstLine  = this.args.titlecard_title_1;
		this.args.zonecard.args.secondLine = this.args.titlecard_title_2;
		this.args.zonecard.args.creditLine = this.args.titlecard_author;
		this.args.zonecard.args.actNumber  = this.args.titlecard_number;

		const layers = this.tileMap.tileLayers;
		const layerCount = layers.length;

		for(let i = 0; i < layerCount; i++)
		{
			if(!this.args.layers[i])
			{
				this.args.layers[i] = new Layer({
					layerId: i
					, viewport: this
					, name: layers[i].name
				});

				this.args.layers[i].args.height = this.args.height;
				this.args.layers[i].args.width  = this.args.width;
			}
		}

		if(this.args.networked)
		{
			const sonic = new Sonic({name:'Player 1', x: 1500, y: 1600});
			const tails = new Tails({name:'Player 2', x: 1400, y: 1600});

			sonic.render(this.tags.actors);
			sonic.onRendered();
			sonic.onAttached && sonic.onAttached();

			tails.render(this.tags.actors);
			tails.onRendered();
			tails.onAttached && tails.onAttached();

			this.auras.add(sonic);
			this.auras.add(tails);

			this.actors.add(sonic);
			this.actors.add(tails);
		}

		this.populateMap();

		if(!this.args.networked)
		{
			const actors = this.actors.list;

			if(!this.playableIterator)
			{
				this.playableIterator = this.playable.entries();

				this.playableIterator.next();
			}

			this.nextControl = this.nextControl || actors[0];
		}
		else if(this.args.networked)
		{
			const actors = this.actors.list;

			this.nextControl = this.nextControl || actors[-1 + this.args.playerId];
		}

		this.nextControl = Object.values(this.args.actors)[0];

		if(this.nextControl)
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
			this.update();

			this.args.level = 'level';

			this.args.running = false;

			this.onTimeout(1000, () => {
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
						this.args.inputName = 'xbox controller & keyboard';

						this.args.inputType = 'input-xbox';
					}
					else
					{
						this.args.inputName = 'playstation controller & keyboard';

						this.args.inputType = 'input-playstation';
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

		let cameraSpeed = 30;

		const actor     = this.controlActor;

		const highJump  = actor.public.highJump;
		const deepJump  = actor.public.deepJump;
		const falling   = actor.public.falling;
		const fallSpeed = actor.public.ySpeed;

		switch(this.controlActor.args.cameraMode)
		{
			case 'airplane':

				this.args.xOffsetTarget = -this.controlActor.args.direction * 0.35 + 0.5;
				this.args.yOffsetTarget = 0.5;

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

				cameraSpeed = 45;

				break;

			case 'cliff':

				this.args.xOffsetTarget = 0.50 + -0.15 * this.controlActor.public.direction;
				this.args.yOffsetTarget = 0.45;

				cameraSpeed = 30;

				break;

			case 'bridge':

				this.args.xOffsetTarget = 0.50;
				this.args.yOffsetTarget = 0.65;

				cameraSpeed = 15;

				break;

			default:

				this.args.xOffsetTarget = 0.5;
				this.args.yOffsetTarget = 0.75;

				cameraSpeed = 10;

				switch(this.controlActor.public.mode)
				{
					case 0:
						this.args.xOffsetTarget = 0.5;
						this.args.yOffsetTarget = 0.6;
						break;

					case 1:
						this.args.xOffsetTarget = 0.25;
						this.args.yOffsetTarget = 0.50;
						break;

					case 2:
						this.args.xOffsetTarget = 0.5;
						this.args.yOffsetTarget = 0.3;
						break;

					case 3:
						this.args.xOffsetTarget = 0.75;
						this.args.yOffsetTarget = 0.50;
						break;
				}

				break;
		}

		if(Math.abs(this.args.yOffsetTarget - this.args.yOffset) < 0.05)
		{
			this.args.yOffset = this.args.yOffsetTarget
		}
		else if(cameraSpeed)
		{
			const offsetDiff = this.args.yOffsetTarget - this.args.yOffset;

			this.args.yOffset += offsetDiff / cameraSpeed;
		}

		if(Math.abs(this.args.xOffsetTarget - this.args.xOffset) < 0.05)
		{
			this.args.xOffset = this.args.xOffsetTarget
		}
		else if(cameraSpeed)
		{
			const offsetDiff = this.args.xOffsetTarget - this.args.xOffset;

			this.args.xOffset += offsetDiff / cameraSpeed;
		}

		if(actor.public.jumping)
		{
			this.maxCameraBound = 80;

			if(deepJump || highJump)
			{
				this.maxCameraBound = 8;
			}
		}
		else
		{
			this.maxCameraBound = 64;
		}

		if(this.cameraBound <= this.maxCameraBound)
		{
			this.cameraBound = this.maxCameraBound;
		}
		else
		{
			this.cameraBound--;
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

		const snapFactor = Math.max(Math.abs(dragDistance / maxDistance), 0.05);
		const snapFrames = 16;
		const snapSpeed  = dragDistance / snapFrames;

		this.args.x = xNext + dragDistance * Math.cos(angle);
		this.args.y = yNext + dragDistance * Math.sin(angle);

		this.args.x -= snapFactor * Math.cos(angle) * snapSpeed;
		this.args.y -= snapFactor * Math.sin(angle) * snapSpeed;

		if(this.args.x > 96)
		{
			this.args.x = 96;
		}

		if(this.args.y > 96)
		{
			this.args.y = 96;
		}

		const xMax = -(this.tileMap.mapData.width * 32) + this.args.width - 96;
		const yMax = -(this.tileMap.mapData.height * 32) + this.args.height - 96;

		if(this.args.x < xMax)
		{
			this.args.x = xMax;
		}

		if(this.args.y < yMax)
		{
			this.args.y = yMax;
		}
	}

	applyMotionBlur()
	{
		const controlActor = this.controlActor;

		if(this.settings.blur && controlActor && this.tags.blur)
		{
			let xBlur = (Number(((this.args.x - this.xPrev) * 100) / 500) ** 2).toFixed(2);
			let yBlur = (Number(((this.args.y - this.yPrev) * 100) / 500) ** 2).toFixed(2);

			let blurAngle = Number(controlActor.realAngle + Math.PI).toFixed(2);

			const maxBlur = 32;

			xBlur = xBlur < maxBlur ? xBlur : maxBlur;
			yBlur = yBlur < maxBlur ? yBlur : maxBlur;

			let blur = (Math.sqrt(xBlur**2 + yBlur**2) / 4).toFixed(2);

			if(blur > 1)
			{
				if(controlActor.public.falling)
				{
					blurAngle = Math.atan2(controlActor.public.ySpeed, controlActor.public.xSpeed);
				}

				this.tags.blurAngle.setAttribute('style', `transform:rotate(calc(1rad * ${blurAngle}))`);
				this.tags.blurAngleCancel.setAttribute('style', `transform:rotate(calc(-1rad * ${blurAngle}))`);
				this.tags.blur.setAttribute('stdDeviation', `${(blur * 0.75) - 1}, 0`);
			}
			else
			{
				this.tags.blurAngle.setAttribute('style', `transform:none;`);
				this.tags.blurAngleCancel.setAttribute('style', `transform:none;`);
				this.tags.blur.removeAttribute('stdDeviation');
			}

			this.xPrev = this.args.x;
			this.yPrev = this.args.y;
		}
		else
		{
			this.tags.blurAngle.setAttribute('style', `transform:none;`);
			this.tags.blurAngleCancel.setAttribute('style', `transform:none;`);
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

		for(const layer of this.args.layers)
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
				let backdropType = '';

				for(const property of backdrop.properties)
				{
					if(property.name === 'backdrop')
					{
						backdropType = property.value;
					}
				}

				if(!backdrop.view)
				{
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
					x: Math.round(this.args.x)
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

		this.tags.bgFilters.style({'--x': this.args.x, '--y': this.args.y});
		// this.tags.fgFilters.style({'--x': this.args.x, '--y': this.args.y});

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
				if(!['layer-switch', 'ring', 'companion-block', 'water-region'].includes(objType))
				{
					continue;
				}
			}

			const objClass = ObjectPalette[objType];

			const actor = Bindable.make(objClass.fromDef(objDef));

			this.actors.add( actor );
			actor.render(this.tags.actors);
			actor.onRendered();

			if(actor.onAttach && actor.onAttach() === false)
			{
				actor.detach();
			}

			// actor.onAttached && actor.onAttached();

			const width  = this.args.width;
			const height = this.args.height;
			const margin = 32;

			const camLeft   = -this.args.x + -16 + -margin;
			const camRight  = -this.args.x + width + -16 + margin;

			const camTop    = -this.args.y;
			const camBottom = -this.args.y + height;

			const actorTop   = actor.y - actor.public.height;
			const actorRight = actor.x + actor.public.width;
			const actorLeft  = actor.x;

			if(camLeft < actorRight && camRight > actorLeft
				&& camBottom > actorTop && camTop < actor.y
			){
				actor.args.display = 'initial';
			}
			else
			{
				actor.args.display = 'none';

				actor.detach();
			}

			if(actor.controllable)
			{
				this.args.controllable[ objDef.name ] = actor;

				// this.auras.add( actor );

				actor.args.display = 'initial';
			}
		}
	}

	spawnActors()
	{
		const spawnDoc = new DocumentFragment;

		let spawned = false;

		for(const spawn of this.spawn.values())
		{
			if(spawn.frame)
			{
				if(spawn.frame <= this.args.frameId)
				{
					this.spawn.delete(spawn);

					this.actors.add(Bindable.make(spawn.object));

					spawn.object.render(spawnDoc);
					spawn.object.onRendered();
					spawn.object.onAttached && spawn.object.onAttached()

					if(spawn.object.onAttach && spawn.object.onAttach() === false)
					{
						spawn.object.detach();
					}

					spawned = true;
				}
			}
			else
			{
				this.spawn.delete(spawn);

				this.actors.add(Bindable.make(spawn.object));

				spawn.object.render(spawnDoc);
				spawn.object.onRendered();
				spawn.object.onAttached && spawn.object.onAttached()

				if(spawn.object.onAttach && spawn.object.onAttach() === false)
				{
					spawn.object.detach();
				}

				spawned = true;
			}
		}

		if(spawned)
		{
			this.tags.actors.append(spawnDoc);
		}
	}

	actorUpdateStart(nearbyCells)
	{
		for(const i in nearbyCells)
		{
			const cell   = nearbyCells[i];
			const actors = cell.values();

			for(const actor of actors)
			{
				if(this.updateStarted.has(actor))
				{
					continue;
				}

				actor.updateStart();

				this.updateStarted.add(actor);
			}
		}
	}

	actorUpdate(nearbyCells)
	{
		for(const i in nearbyCells)
		{
			const cell   = nearbyCells[i];
			const actors = cell.values();

			for(const actor of actors)
			{
				if(this.updated.has(actor))
				{
					continue;
				}

				actor.update();

				this.setColCell(actor);

				this.updated.add(actor);
			}
		}
	}

	actorUpdateEnd(nearbyCells)
	{
		const width  = this.args.width;
		const height = this.args.height;
		const x = this.args.x;
		const y = this.args.y;

		for(const i in nearbyCells)
		{
			const cell   = nearbyCells[i];
			const actors = cell.values();

			for(const actor of actors)
			{
				if(this.updateEnded.has(actor))
				{
					continue;
				}

				actor.updateEnd();

				this.updateEnded.add(actor);
			}
		}
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
			const actors = cell.values();

			for(const actor of actors)
			{
				result.add(actor);
			}
		}

		return result;
	}

	update()
	{
		if(this.args.frameId % 5 === 0)
		{
			for(const [detachee, detacher] of this.willDetach)
			{
				this.willDetach.delete(detachee);

				detacher();
			}
		}

		this.callFrameOuts();

		this.args.frameId++;

		this.args.fpsSprite.args.value = Number(this.args.fps).toFixed(1);

		const time  = (Date.now() - this.startTime) / 1000;
		let minutes = String(Math.floor(Math.abs(time) / 60)).padStart(2,'0')
		let seconds = String((Math.abs(time) % 60).toFixed(2)).padStart(5,'0');

		const neg = time < 0 ? '-' : '';

		if(neg)
		{
			minutes = Number(minutes);
		}

		const controller = this.controlActor
			? this.controlActor.controller
			: this.controller;

		if(!this.args.started)
		{
			this.takeInput(controller);

			this.startTime = Date.now();

			if(this.args.titlecard)
			{
				this.args.titlecard.input(controller);
			}

			return;
		}
		else if(this.args.paused && !this.args.networked)
		{
			this.takeInput(controller);

			this.args.pauseMenu.input(controller);

			return;
		}

		this.args.timer.args.value.args.value = `${neg}${minutes}:${seconds}`;

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
				else
				{
					// this.args.focusMe.args.hide = '';
				}

				this.takeInput(this.controlActor.controller);
				this.controlActor.readInput();
			}

			// if(!this.args.maxSpeed)
			// {
			// 	this.args.maxSpeed = this.controlActor.args.gSpeedMax;
			// }

			// this.controlActor.args.gSpeedMax = this.args.maxSpeed;

			// this.controlActor.willStick = !!this.args.willStick;
			// this.controlActor.stayStuck = !!this.args.stayStuck;

			this.controlActor.crawling = false;
			this.controlActor.running  = false;
		}

		this.updateStarted.clear();
		this.updated.clear();
		this.updateEnded.clear();

		if(this.args.running)
		{
			for(const region of this.regions)
			{
				region.updateStart();
				this.updateStarted.add(region);

				region.update();
				this.updated.add(region);
			}
			const actorCells = new WeakMap;

			for(const actor of this.auras)
			{
				const nearbyCells = this.getNearbyColCells(actor);

				actorCells.set(actor, nearbyCells);

				if(this.updateStarted.has(actor))
				{
					continue;
				}

				actor.updateStart();

				this.updateStarted.add(actor);

				this.actorUpdateStart(nearbyCells);
			}

			for(const actor of this.auras)
			{
				const nearbyCells = actorCells.get(actor);

				if(this.updated.has(actor))
				{
					continue;
				}

				actor.update();

				this.updated.add(actor);

				this.actorUpdate(nearbyCells);
			}

			if(this.controlActor)
			{
				this.rings.args.value = this.controlActor.args.rings;
				// this.coins.args.value = this.controlActor.args.coins;
				this.emeralds.args.value = `${this.controlActor.args.emeralds}/7`;

				this.args.hasRings    = !!this.controlActor.args.rings;
				// this.args.hasCoins    = !!this.controlActor.args.coins;
				this.args.hasEmeralds = !!this.controlActor.args.emeralds;

				this.args.char.args.value = this.controlActor.args.name;
				this.args.charName        = this.controlActor.args.name;

				// this.args.xPos.args.value     = Math.round(this.controlActor.x);
				// this.args.yPos.args.value     = Math.round(this.controlActor.y);

				// this.args.ground.args.value   = this.controlActor.args.landed;
				// this.args.gSpeed.args.value   = this.controlActor.args.gSpeed.toFixed(2);
				// this.args.xSpeed.args.value   = Math.round(this.controlActor.args.xSpeed);
				// this.args.ySpeed.args.value   = Math.round(this.controlActor.args.ySpeed);
				// this.args.angle.args.value    = (Math.round((this.controlActor.args.groundAngle) * 1000) / 1000).toFixed(3);
				// this.args.airAngle.args.value = (Math.round((this.controlActor.args.airAngle) * 1000) / 1000).toFixed(3);

				const modes = ['FLOOR', 'L-WALL', 'CEILING', 'R-WALL'];

				// this.args.mode.args.value = modes[Math.floor(this.controlActor.args.mode)] || Math.floor(this.controlActor.args.mode);
			}

			for(const actor of this.auras)
			{
				const nearbyCells = actorCells.get(actor);

				if(!this.updateEnded.has(actor))
				{
					actor.updateEnd();

					this.updateEnded.add(actor);

					this.actorUpdateEnd(nearbyCells);
				}
			}

			for(const region of this.regions)
			{
				if(!this.updateEnded.has(region))
				{
					region.updateEnd();
					this.updateEnded.add(region);
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
			const wakeDoc = new DocumentFragment;

			let wakeActors = false;

			for(const actor of this.actors.list)
			{
				if(!actor)
				{
					continue;
				}

				const x = actor.x;
				const y = actor.y;
				const width  = actor.public.width;
				const height = actor.public.height;

				if(!this.auras.has(actor))
				{
					const actorBottom = y + 64;
					const actorTop    = y - height - 64;
					const actorRight  = x + width  + 64;
					const actorLeft   = x - width  - 64;

					if(inAuras.has(actor))
					{
						continue;
					}

					let offscreenX = 0;
					let offscreenY = 0;

					if(camLeft < actorRight)
					{
						offscreenX = actorRight + -camLeft + -200;
					}
					else if(camRight > actorLeft)
					{
						offscreenX = camRight + -actorLeft + 200;
					}

					if(camBottom > actorTop)
					{
						offscreenY = camBottom + -actorTop + -200;
					}
					else if(camTop < actorBottom)
					{
						offscreenY = actorBottom + -camTop + 200;
					}

					if(camLeft < actorRight
						&& camRight > actorLeft
						&& camBottom > actorTop
						&& camTop < actorBottom
						&& !(actor instanceof LayerSwitch)
					){
						actor.args.display = 'initial';

						if(!actor.vizi)
						{
							if(!actor.public.hidden)
							{
								actor.nodes.map(n => wakeDoc.append(n));
							}

							wakeActors = true;

							actor.wakeUp();

						}

						this.willDetach.delete(actor);

						actor.vizi = true;
					}
					else if(actor.vizi && (offscreenX > 0 || offscreenY > 0) && !actor.willhide)
					{
						this.willDetach.set(actor, () => {

							actor.sleep();

							actor.detach();

							actor.vizi = false;

							actor.willhide = null;

							this.willDetach.delete(actor);
						});
					}

					inAuras.add(actor);
				}
			}

			if(wakeActors)
			{
				this.tags.actors.append(wakeDoc);
			}
		}

		this.spawnActors();

		if(this.nextControl)
		{
			this.auras.delete(this.controlActor);

			this.controlActor && this.controlActor.sprite.parentNode.classList.remove('actor-selected');

			this.controlActor = this.nextControl;

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

		this.args.moveCard = this.moveCard;

		this.collisions = new WeakMap;

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
	}

	click(event)
	{
		if(this.args.isReplaying)
		{
			this.controlActor.controller.zero();
			this.stop();
		}
	}

	regionAtPoint(x, y)
	{
		for(const region of this.regions.values())
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
					return region;
				}
			}
		}
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

		this.getNearbyColCells({x,y}).forEach(cell => {

			for(const actor of cell.values())
			{
				if(actor.removed)
				{
					continue;
				}

				const actorArgs = actor.public;

				const actorX = actorArgs.x;
				const actorY = actorArgs.y;

				const width  = actorArgs.width;
				const height = actorArgs.height;

				const myRadius = Math.max(Math.floor(w / 2)-1, 0);

				const myLeft   = x - myRadius;
				const myRight  = x + myRadius;
				const myTop    = y - h;
				const myBottom = y;

				const offset = Math.floor(width / 2);

				const otherLeft   = -offset + actorX;
				const otherRight  = -offset + actorX + width;
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

		});

		actorPointCache.set(cacheKey, actors);

		return actors;
	}

	screenBox()
	{
		return [
			this.camera.x   - Math.floor(this.width/2)
			, this.camera.y - Math.floor(this.height/2)
			, this.camera.x + Math.ceil(this.width/2)
			, this.camera.y + Math.ceil(this.height/2)
		];
	}

	padConnected(event)
	{
		this.gamepad = event.gamepad;
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

		// const column = colCells.get(cellX) || new Map;

		// if(!column.has(cellY))
		// {
		// 	column.set(cellY, new Map);
		// }

		// const cell = column.get(cellY) || new Set;

		// colCells[cellX][cellY] = colCells[cellX][cellY] || new Set;

		// return colCells[cellX][cellY];

		// return cell;
	}

	setColCell(actor)
	{
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
			, this.getColCell({x:colB, y:rowB})
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

	change(event)
	{
		if(!event.target.value)
		{
			return;
		}

		if(!this.args.controllable[ event.target.value ])
		{
			return;
		}

		const actor = this.args.controllable[ event.target.value ];

		this.nextControl = actor;

		this.tags.viewport.focus();
	}

	screenFilter(filterName)
	{
		this.args.screenFilter = filterName;
	}

	reset()
	{
		this.stop();

		for(const i in this.actors.list)
		{
			const actor = this.actors.list[i];

			this.actors.remove(actor);
		}

		this.controlActor && this.actors.remove(this.controlActor);

		this.spawn.clear();
		this.actorPointCache.clear();

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.args.populated = false;
		this.controlActor   = null;
		this.args.frameId   = -1;

		this.tags.viewport.focus();
	}

	quit()
	{
		for(const i in this.actors.list)
		{
			const actor = this.actors.list[i];

			this.actors.remove(actor);
		}

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.playableIterator = false;

		this.args.populated = false;
		this.args.paused    = false;
		this.args.started   = false;
		this.controlActor   = null;
		this.args.frameId   = -1;

		this.args.timer.args.value.args.value = '';
		this.emeralds.args.value = 0;
		this.rings.args.value    = 0;
		this.coins.args.value    = 0;

		this.args.hasRings    = false;
		this.args.hasCoins    = false;
		this.args.hasEmeralds = false;

		this.args.char.args.value = '';
		this.args.charName        = '';

		this.args.level = false;

		const layers = this.args.layers;
		const layerCount = layers.length;

		for(let i = 0; i < layerCount; i++)
		{
			if(!layers[i])
			{
				continue;
			}

			const layer = layers[i];

			layer.remove();
		}

		this.args.layers = [];

		this.args.titlecard = new Series({cards: this.homeCards()}, this);

		this.args.titlecard.play();
	}

	introCards()
	{
		return [
			new LoadingCard({timeout: 350, text: 'loading'}, this)
			, new BootCard({timeout: 3500})
			, new SeanCard({timeout: 5000}, this)
			, ...this.homeCards()
		]
	}

	homeCards()
	{
		const titlecard = this.args.zonecard = new Titlecard({}, this)

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

	// onFrameInterval(frames, callback)
	// {
	// 	if(frames <= 0)
	// 	{
	// 		return;
	// 	}

	// 	const callFrame = this.args.frameId + frames;

	// 	if(!this.callFrames.has(callFrame))
	// 	{
	// 		this.callFrames.set(callFrame, new Set);
	// 	}

	// 	this.callFrames.get(callFrame).add(callback);
	// }

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

	pauseGame()
	{
		this.focus();

		this.args.paused = true;

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
}
