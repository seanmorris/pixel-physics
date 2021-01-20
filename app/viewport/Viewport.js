import { Bindable } from 'curvature/base/Bindable';
import { Bag  } from 'curvature/base/Bag';
import { Tag  } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

import { Keyboard } from 'curvature/input/Keyboard';

// import { Actor   } from '../actor/Actor';
import { TileMap } from '../tileMap/TileMap';

import { QuestionBlock } from '../actor/QuestionBlock';
import { BrokenMonitor } from '../actor/BrokenMonitor';
import { MarbleBlock } from '../actor/MarbleBlock';
import { LayerSwitch } from '../actor/LayerSwitch';

import { Explosion } from '../actor/Explosion';
import { StarPost } from '../actor/StarPost';
import { Emerald } from '../actor/Emerald';
import { Window } from '../actor/Window';
import { Monitor } from '../actor/Monitor';
import { Spring } from '../actor/Spring';
import { Ring } from '../actor/Ring';
import { Coin } from '../actor/Coin';

import { PointActor } from '../actor/PointActor';

import { Projectile } from '../actor/Projectile';
import { TextActor } from '../actor/TextActor';

import { EggMobile } from '../actor/EggMobile';
import { DrillCar } from '../actor/DrillCar';

import { NuclearSuperball } from '../actor/NuclearSuperball';

import { Eggman     } from '../actor/Eggman';
import { Eggrobo     } from '../actor/Eggrobo';
import { MechaSonic } from '../actor/MechaSonic';

import { Sonic }      from '../actor/Sonic';
import { Tails }      from '../actor/Tails';
import { Knuckles }   from '../actor/Knuckles';

import { Seymour }   from '../actor/Seymour';

import { Rocks }   from '../actor/Rocks';
import { Switch }   from '../actor/Switch';

import { Region }   from '../actor/Region';

import { CharacterString } from '../ui/CharacterString';
import { HudFrame } from '../ui/HudFrame';

import { Layer } from './Layer';

import { Controller } from '../controller/Controller';

const objectPalette = {
	player: NuclearSuperball
	, spring: Spring
	, 'layer-switch': LayerSwitch
	, 'star-post': StarPost
	, 'q-block': QuestionBlock
	, 'projectile': Projectile
	, 'marble-block': MarbleBlock
	, 'drill-car':    DrillCar
	, 'egg-mobile':   EggMobile
	, 'rocks-tall':   Rocks
	, 'rocks-med':    Rocks
	, 'rocks-short':  Rocks
	, 'mecha-sonic':  MechaSonic
	, 'sonic':        Sonic
	, 'tails':        Tails
	, 'knuckles':     Knuckles
	, 'eggman':       Eggman
	, 'eggrobo':      Eggrobo
	, 'seymour':      Seymour
	, 'switch':       Switch
	, 'window':       Window
	, 'emerald':      Emerald
	, 'region':       Region
	, 'ring':         Ring
	, 'coin':         Coin
};

const ColCellsNear = Symbol('collision-cells-near');
const ColCell = Symbol('collision-cell');

export class Viewport extends View
{
	template  = require('./viewport.html');

	constructor(args,parent)
	{
		super(args,parent);

		// this.hud = new Hud
		this.sprites = new Bag;
		this.world   = null;

		Object.defineProperty(this, 'tileMap', {value: new TileMap});

		this.particles = new Bag;

		this.args.particles = this.particles.list;

		this.args.currentActor = '';

		this.args.yOffsetTarget = 0.75;
		this.args.yOffset = 0.5;

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

		this.args.char   = new CharacterString({value:''});

		this.args.xPos   = new CharacterString({value:0});
		this.args.yPos   = new CharacterString({value:0});
		this.args.gSpeed = new CharacterString({value:0, high: 199, med: 99, low: 49});
		this.args.ground = new CharacterString({value:''});
		this.args.xSpeed = new CharacterString({value:0});
		this.args.ySpeed = new CharacterString({value:0});
		this.args.mode   = new CharacterString({value:0});
		this.args.angle  = new CharacterString({value:0});

		this.args.airAngle  = new CharacterString({value:0});

		this.args.fpsSprite = new CharacterString({value:0});
		this.args.frame     = new CharacterString({value:0});

		this.args.bindTo('frameId', v => this.args.frame.args.value = Number(v) );
		this.args.bindTo('fps', v => this.args.fpsSprite.args.value = Number(v).toFixed(2) );

		this.args.frameId = -1;

		this.rings = new CharacterString({value:0});
		this.coins = new CharacterString({value:0});
		this.emeralds = new CharacterString({value:'0/7'});

		this.args.emeralds = new HudFrame({value:this.emeralds, type: 'emerald-frame'});
		this.args.timer = new HudFrame({value:new CharacterString({value:'00:00.000'})});
		this.args.rings = new HudFrame({value:this.rings, type: 'ring-frame'});
		this.args.coins = new HudFrame({value:this.coins, type: 'coin-frame'});

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
		// this.args.height = 32 * 8 * 2;
		// this.args.scale  = 1;

		this.args.x = this.args.x || 0;
		this.args.y = this.args.y || 0;

		this.args.layers = [];

		this.args.animation = '';

		this.spawn   = new Set;
		this.regions = new Set;
		this.auras   = new Set;

		this.actorsById = {};

		this.actors = new Bag((i,s,a) => {
			if(a == Bag.ITEM_ADDED)
			{
				i.viewport = this;

				this.setColCell(i);

				if(i instanceof Region)
				{
					this.regions.add(i);
				}

				this.actorsById[i.args.id] = i;
			}
			else if(a == Bag.ITEM_REMOVED)
			{
				i.viewport = null;

				if(i[ColCell])
				{
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
			}
		});

		this.blocks = new Bag;

		this.args.blocks = this.blocks.list;
		this.args.actors = this.actors.list;

		this.args.bindTo('willStick', v => {
			if(v)
			{
				this.args.stayStuck = true;
			}
		});

		this.args.bindTo('stayStuck', v => {
			if(!v)
			{
				this.args.willStick = false;
			}
		});

		this.listen(window, 'gamepadconnected', event => this.padConnected(event));

		this.colCellCache = {};
		this.colCellDiv = this.args.width > this.args.height
		 	? this.args.width * 0.75
		 	: this.args.height * 0.75;

		this.colCells   = {};

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

		this.args.controlCard = View.from(require('../cards/basic-controls.html'));
		this.args.moveCard    = View.from(require('../cards/basic-moves.html'));

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.replayInputs = [];
		// this.replayInputs = JSON.parse(localStorage.getItem('replay')) || [];

		if(this.replayInputs.length)
		{
			this.args.hasRecording = true;
		}

		this.args.topLine.args.value = ' i cant believe its not canvas. ';
		this.args.status.args.value = ' click here to exit demo. ';

	}

	fullscreen()
	{
		this.args.focusMe.args.hide = 'hide';

		this.initScale = this.args.scale;

		this.tags.viewport.requestFullscreen().then(res=>{
			this.onTimeout(100, ()=>{

				const hScale = window.innerHeight / this.args.height;
				const vScale = window.innerWidth / this.args.width;

				this.args.scale = hScale > vScale ? hScale : vScale;
				this.args.fullscreen = 'fullscreen';

				this.args.status.args.value = ' hit escape to revert. ';

				this.args.status.args.hide  = '';

				this.onTimeout(2500, ()=>{
					this.args.focusMe.args.hide = '';
					this.args.status.args.hide  = 'hide';
					this.tags.viewport.focus();
				});
			});
		});
	}

	onAttached(event)
	{
		this.tags.blurDistance.setAttribute('style', `filter:url(#motionBlur)`);

		this.listen(document, 'fullscreenchange', (event) => {
			if (!document.fullscreenElement)
			{
				this.args.scale = this.initScale;
				this.args.fullscreen = ''
			}
		});

		this.tags.frame.style({
			'--width': this.args.width
			, '--height': this.args.height
			, '--scale': this.args.scale
		});

		this.update();

		if(!this.startTime)
		{
			this.startTime = Date.now() + 4.75 * 1000;
		}

		this.args.paused = true;

		this.args.status.args.hide = 'hide';

		this.args.animation = 'start';

		this.onTimeout(250, () => {

			this.args.animation = '';

			this.onTimeout(750, () => {
				this.args.animation = 'opening';
				this.tags.viewport.focus();

				this.onTimeout(750, () => {
					this.args.animation = 'opening2';
					this.tags.viewport.focus();

					this.update();

					this.onTimeout(1500, () => {
						this.args.animation = 'closing';
						this.tags.viewport.focus();

						this.args.focusMe.args.value = ' Click here to enable keyboard control. ';
						this.args.status.args.hide = '';

						this.onTimeout(750, () => {
							this.args.animation = 'closed';
							this.tags.viewport.focus();
						});

						this.onTimeout(500, () => {
							this.args.paused = false;
							this.tags.viewport.focus();
							this.startTime = Date.now();
						});
					});
				});
			});
		});

		this.listen(document.body, 'click', event => {

			if(event.target !== document.body)
			{
				return;
			}

			this.tags.viewport.focus()
		});

		this.args.scale = this.args.scale || 1;

		const keyboard = Keyboard.get();

		keyboard.listening = true

		keyboard.focusElement = this.tags.viewport.node;
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
			}
		}

		if(this.args.isRecording)
		{
			const frozenFrame = {
				frame:   this.args.frameId
				, input: controller.serialize()
			};

			if(this.args.frameId % 20)
			{
				frozenFrame['state'] = {
					[this.controlActor.public.id]: {
						gSpeed:   this.controlActor.public.gSpeed
						, xSpeed: this.controlActor.public.xSpeed
						, ySpeed: this.controlActor.public.ySpeed
						, x: this.controlActor.public.x
						, y: this.controlActor.public.y
					}
				};
			}

			this.replayInputs.push(frozenFrame);
		}
	}

	readInput()
	{
		// if(!this.controlActor)
		// {
		// 	return;
		// }

		// const controller = this.controlActor.controller;

		// if(0 in controller.axes)
		// {
		// 	this.controlActor.xAxis = controller.axes[0].magnitude;
		// }

		// if(1 in controller.axes)
		// {
		// 	this.controlActor.yAxis = controller.axes[1].magnitude;
		// }

		// if(controller.buttons[0] && controller.buttons[0].delta === 1)
		// {
		// 	this.controlActor.command_0 && this.controlActor.command_0(); // jump
		// }

		// if(controller.buttons[2] && controller.buttons[2].delta === 1)
		// {
		// 	this.controlActor.command_2 && this.controlActor.command_2(); // shoot
		// }

		// if(controller.buttons[1])
		// {
		// 	if(controller.buttons[1].pressure)
		// 	{
		// 		this.controlActor.running  = false;
		// 		this.controlActor.crawling = true;
		// 	}
		// 	else if(controller.buttons[1].pressure || controller.buttons[4] && controller.buttons[4].pressure)
		// 	{
		// 		this.controlActor.running  = true;
		// 		this.controlActor.crawling = false;
		// 	}
		// }


		// if(gamepad.axes[1] && Math.abs(gamepad.axes[1]) > 0.25)
		// {
		// 	if(this.controlActor.args.mode === 1)
		// 	{
		// 		this.controlActor.xAxis = gamepad.axes[1];
		// 	}
		// 	else if(this.controlActor.args.mode === 3)
		// 	{
		// 		this.controlActor.xAxis = gamepad.axes[1];
		// 	}
		// 	else
		// 	{
		// 		this.controlActor.yAxis = gamepad.axes[1];
		// 	}
		// }
		// else
		// {
		// 	this.controlActor.yAxis = 0;
		// }

		// if(gamepad.buttons[14].pressed)
		// {
		// 	this.controlActor.xAxis = -1;
		// }
		// else if(gamepad.buttons[15].pressed)
		// {
		// 	this.controlActor.xAxis = 1;
		// }
		// else if(gamepad.buttons[12].pressed)
		// {
		// 	if(this.controlActor.args.mode === 1)
		// 	{
		// 		this.controlActor.xAxis = -1;
		// 	}
		// 	else if(this.controlActor.args.mode === 3)
		// 	{
		// 		this.controlActor.xAxis = 1;
		// 	}

		// 	this.controlActor.yAxis = -1;
		// }
		// else if(gamepad.buttons[13].pressed)
		// {
		// 	if(this.controlActor.args.mode === 1)
		// 	{
		// 		this.controlActor.xAxis = 1;
		// 	}
		// 	else if(this.controlActor.args.mode === 3)
		// 	{
		// 		this.controlActor.xAxis = -1;
		// 	}

		// 	this.controlActor.yAxis = 1;
		// }

		// if(gamepad.buttons[12].pressed)
		// {
		// 	this.controlActor.yAxis = -1;
		// }
		// else if(gamepad.buttons[13].pressed)
		// {
		// 	this.controlActor.yAxis = 1;
		// }
	}

	moveCamera()
	{
		if(!this.controlActor)
		{
			return;
		}

		let cameraSpeed = 15;

		if(this.controlActor.args.falling)
		{
			this.args.yOffsetTarget = 0.5;
			cameraSpeed = 25;

		}
		else if(this.controlActor.args.mode === 2)
		{
			this.args.yOffsetTarget = 0.25;
			cameraSpeed = 10;
			// if(this.controlActor.args.cameraMode == 'normal')
			// {
			// 	this.args.yOffsetTarget = 0.25;
			// 	cameraSpeed = 10;
			// }
			// else
			// {
			// 	this.args.yOffsetTarget = 0.5;
			// 	cameraSpeed = 10;
			// }
		}
		else if(this.controlActor.args.mode)
		{
			this.args.yOffsetTarget = 0.5;
		}
		else if(this.controlActor.args.cameraMode == 'normal')
		{
			this.args.yOffsetTarget = 0.75;
			cameraSpeed = 10;
		}
		else
		{
			this.args.yOffsetTarget = 0.5;
			cameraSpeed = 20;
		}

		const xNext = -this.controlActor.x + this.args.width  * 0.5;
		const yNext = -this.controlActor.y + this.args.height * this.args.yOffset;

		this.args.x = xNext;
		this.args.y = yNext;

		if(Math.abs(this.args.yOffsetTarget - this.args.yOffset) < 0.01)
		{
			this.args.yOffset = this.args.yOffsetTarget
		}
		else
		{
			this.args.yOffset += ((this.args.yOffsetTarget - this.args.yOffset) / cameraSpeed);
		}

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

	updateBackground()
	{
		const layers = this.tileMap.tileLayers;
		const layerCount = layers.length;

		let controlActor = this.controlActor;

		if(controlActor && controlActor.standingOn && controlActor.standingOn.isVehicle)
		{
			controlActor = this.controlActor.standingOn;
		}

		if(controlActor && this.tags.blur)
		{
			let xBlur = (Number(((controlActor.x - this.xPrev) * 100) / 500) ** 2).toFixed(2);
			let yBlur = (Number(((controlActor.y - this.yPrev) * 100) / 500) ** 2).toFixed(2);

			let blurAngle = Number(controlActor.realAngle + Math.PI).toFixed(2);

			if(controlActor.public.falling)
			{
				blurAngle = Math.atan2(controlActor.public.ySpeed, controlActor.public.xSpeed);
			}

			const maxBlur = 32;

			xBlur = xBlur < maxBlur ? xBlur : maxBlur;
			yBlur = yBlur < maxBlur ? yBlur : maxBlur;

			const blur = (Math.sqrt(xBlur**2 + yBlur**2) / 4).toFixed(2);

			this.tags.blurAngle.setAttribute('style', `transform:rotate(calc(1rad * ${blurAngle}))`);
			this.tags.blurAngleCancel.setAttribute('style', `transform:rotate(calc(-1rad * ${blurAngle}))`);
			this.tags.blur.setAttribute('stdDeviation', `${blur}, 0`);

			this.xPrev = controlActor.x;
			this.yPrev = controlActor.y;
		}

		for(let i = 0; i < layerCount; i++)
		{
			if(!this.args.layers[i])
			{
				this.args.layers[i] = new Layer({layerId: i});
				this.args.layers[i].args.height = this.args.height;
				this.args.layers[i].args.width  = this.args.width;
			}

			this.args.layers[i].x = this.args.x;
			this.args.layers[i].y = this.args.y;

			this.args.layers[i].update(this.tileMap);
		}

		this.tags.content.style({
			'--x': Math.round(this.args.x)
			, '--y': Math.round(this.args.y)
		});

		const xMod = this.args.x < 0
			? Math.round(this.args.x % (this.args.blockSize))
			: (-this.args.blockSize + Math.round(this.args.x % this.args.blockSize)) % this.args.blockSize;

		const yMod = this.args.y < 0
			? Math.round(this.args.y % (this.args.blockSize))
			: (-this.args.blockSize + Math.round(this.args.y % this.args.blockSize)) % this.args.blockSize;

		this.tags.background.style({
			transform: `translate( ${xMod}px, ${yMod}px )`
		});

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

		for(let i in objDefs)
		{
			const objDef  = objDefs[i];
			const objType = objDef.type;

			if(!objectPalette[objType])
			{
				continue;
			}

			const objClass = objectPalette[objType];

			const obj = objClass.fromDef(objDef);

			this.actors.add( obj );

			if(obj.controllable || obj.args.controllable)
			{
				this.args.controllable[ objDef.name ] = obj;

				// this.auras.add( obj );
			}

		}

		this.actors.add( new TextActor({x: 1300, y:1800}) );
	}

	spawnActors()
	{
		for(const spawn of this.spawn.values())
		{
			if(spawn.frame <= this.args.frameId)
			{
				this.spawn.delete(spawn);

				this.actors.add(spawn.object);
			}
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

				actor.args.display = 'initial';

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

	update()
	{
		const time  = (Date.now() - this.startTime) / 1000;
		let minutes = String(Math.floor(Math.abs(time) / 60)).padStart(2,'0')
		let seconds = String((Math.abs(time) % 60).toFixed(2)).padStart(5,'0');

		const neg = time < 0 ? '-' : '';

		if(neg)
		{
			minutes = Number(minutes);
		}

		if(!this.args.populated)
		{
			this.populateMap();
		}

		this.args.timer.args.value.args.value = `${neg}${minutes}:${seconds}`;

		this.actorPointCache.clear();

		if(this.args.paused)
		{
			this.tags.frame.style({
				'--scale':   this.args.scale
				, '--width': this.args.width
			});

			return;
		}

		this.args.frameId++;

		if(this.controlActor)
		{
			if(this.args.isReplaying)
			{
				this.args.focusMe.args.hide = 'hide';

				const replay = this.replayInputs[this.args.frameId];

				if(replay)
				{
					if(replay.input)
					{
						this.controlActor.controller.replay(replay.input);
					}

					if(replay.state)
					{
						for(const actorId in replay.state)
						{
							const state = replay.state[actorId];

							const actor = this.actorsById[actorId];

							Object.assign(actor.args, state);
						}
					}
				}
				else
				{
					this.args.isReplaying = false;
				}
			}
			else
			{
				this.args.focusMe.args.hide = '';

				this.takeInput(this.controlActor.controller);
			}

			this.controlActor.readInput();

			if(!this.args.maxSpeed)
			{
				this.args.maxSpeed = this.controlActor.args.gSpeedMax;
			}

			this.controlActor.args.gSpeedMax = this.args.maxSpeed;

			this.controlActor.willStick = !!this.args.willStick;
			this.controlActor.stayStuck = !!this.args.stayStuck;

			this.controlActor.crawling = false;
			this.controlActor.running  = false;
		}
		else
		{
			const actors = this.actors.list;

			this.nextControl = this.nextControl || actors[0];
		}

		this.updateStarted.clear();
		this.updated.clear();
		this.updateEnded.clear();

		for(const region of this.regions.values())
		{
			region.updateStart();
			this.updateStarted.add(region);

			region.update();
			this.updated.add(region);
		}

		for(const actor of this.auras.values())
		{
			const nearbyCells = this.getNearbyColCells(actor);

			if(!this.updateStarted.has(actor))
			{
				actor.updateStart();

				this.updateStarted.add(actor);

				actor.args.display = 'initial';

				this.actorUpdateStart(nearbyCells);
			}

			if(!this.updated.has(actor))
			{
				actor.update();

				this.updated.add(actor);

				this.actorUpdate(nearbyCells);
			}

		}

		if(this.controlActor)
		{
			this.moveCamera();
		}

		this.updateBackground();

		if(this.controlActor)
		{
			if(this.rings.args.value != this.controlActor.args.rings)
			{
				this.rings.args.color = 'yellow';
			}
			else
			{
				this.rings.args.color = '';
			}

			if(this.coins.args.value != this.controlActor.args.coins)
			{
				this.coins.args.color = 'yellow';
			}
			else
			{
				this.coins.args.color = '';
			}

			if(this.emeralds.args.value[0] != this.controlActor.args.emeralds)
			{
				this.emeralds.args.color = 'yellow';
			}
			else
			{
				this.emeralds.args.color = '';
			}

			this.rings.args.value = this.controlActor.args.rings;
			this.coins.args.value = this.controlActor.args.coins;
			this.emeralds.args.value = `${this.controlActor.args.emeralds}/7`;

			this.args.hasRings    = !!this.controlActor.args.rings;
			this.args.hasCoins    = !!this.controlActor.args.coins;
			this.args.hasEmeralds = !!this.controlActor.args.emeralds;

			this.args.char.args.value     = this.controlActor.args.name;
			this.args.xPos.args.value     = Math.round(this.controlActor.x);
			this.args.yPos.args.value     = Math.round(this.controlActor.y);
			this.args.ground.args.value   = this.controlActor.args.landed;
			this.args.gSpeed.args.value   = this.controlActor.args.gSpeed.toFixed(2);
			this.args.xSpeed.args.value   = Math.round(this.controlActor.args.xSpeed);
			this.args.ySpeed.args.value   = Math.round(this.controlActor.args.ySpeed);
			this.args.angle.args.value    = (Math.round((this.controlActor.args.groundAngle) * 1000) / 1000).toFixed(3);
			this.args.airAngle.args.value = (Math.round((this.controlActor.args.airAngle) * 1000) / 1000).toFixed(3);

			const modes = ['FLOOR', 'L-WALL', 'CEILING', 'R-WALL'];

			this.args.mode.args.value = modes[Math.floor(this.controlActor.args.mode)] || Math.floor(this.controlActor.args.mode);

			this.controlActor.updateEnd();

			this.updateEnded.add(this.controlActor);

			const nearbyCells = this.getNearbyColCells(this.controlActor);

			this.actorUpdateEnd(nearbyCells);
		}

		for(const region of this.regions.values())
		{
			region.updateEnd();
			this.updateEnded.add(region);
		}

		const x = this.args.x;
		const y = this.args.y;

		const width  = this.args.width;
		const height = this.args.height;

		for(const i in this.actors.list)
		{
			const actor = this.actors.list[i];

			if(!(actor instanceof Region))
			{
				const actorX = actor.x + x - (width / 2);
				const actorY = actor.y + y - (height / 2);

				if(Math.abs(actorX) > width)
				{
					actor.args.display = 'none';
				}
				else if(Math.abs(actorY) > height)
				{
					actor.args.display = 'none';
				}
				else
				{
					actor.args.display = 'initial';
				}
			}
		}

		this.spawnActors();

		if(this.nextControl)
		{
			if(this.controlActor)
			{
				this.auras.delete(this.controlActor);
			}

			this.controlActor = this.nextControl;

			this.auras.add(this.controlActor);

			this.args.maxSpeed = null;
			this.nextControl   = null;
		}
	}

	click(event)
	{
		this.args.topLine.args.hide = 'hide';
		this.args.status.args.hide  = 'hide';

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

	actorsAtPoint(x, y)
	{
		const cacheKey = [x,y].join('::');
		const actorPointCache = this.actorPointCache;

		if(actorPointCache.has(cacheKey))
		{
			return actorPointCache.get(cacheKey);
		}

		const actors = [];

		this.getNearbyColCells({x,y}).map(cell => {

			for(const actor of cell.values())
			{
				// if(actor.removed)
				// {
				// 	cell.delete(actor);
				// 	continue;
				// }

				const actorArgs = actor.public;

				const actorX = actorArgs.x;
				const actorY = actorArgs.y;

				const width  = actorArgs.width;
				const height = actorArgs.height;

				const offset = Math.floor(width / 2);

				const left   = -offset + actorX;
				const right  = -offset + actorX + width;

				const top    = actorY - height;
				const bottom = actorY;

				if(x >= left && right > x)
				{
					if(bottom >= y && y > top)
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

	getColCell(actor)
	{
		const colCellDiv = this.colCellDiv;
		const colCells   = this.colCells;

		const cellX = Math.floor( actor.x / colCellDiv );
		const cellY = Math.floor( actor.y / colCellDiv );

		colCells[cellX] = colCells[cellX] || {};

		colCells[cellX][cellY] = colCells[cellX][cellY] || new Set;

		return colCells[cellX][cellY];
	}

	setColCell(actor)
	{
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
		const actorX = actor.public ? actor.public.x : actor.x;
		const actorY = actor.public ? actor.public.y : actor.y;

		const colCellDiv = this.colCellDiv
		const cellX = Math.floor( actorX / colCellDiv );
		const cellY = Math.floor( actorY / colCellDiv );

		const name = `${cellX}::${cellY}`;

		let cache = this.colCellCache[name];

		if(cache)
		{
			return cache.filter(set=>set.size);
		}

		const space = colCellDiv;

		this.colCellCache[name] = cache = [
			  this.getColCell({x:actorX - space, y:actorY - space})
			, this.getColCell({x:actorX - space, y:actorY})
			, this.getColCell({x:actorX - space, y:actorY + space})

			, this.getColCell({x:actorX, y:actorY - space})
			, this.getColCell({x:actorX, y:actorY})
			, this.getColCell({x:actorX, y:actorY + space})

			, this.getColCell({x:actorX + space, y:actorY - space})
			, this.getColCell({x:actorX + space, y:actorY})
			, this.getColCell({x:actorX + space, y:actorY + space})
		]

		return cache.filter(set=>set.size);
	}

	change(event)
	{
		console.log(event.target.value);

		if(!event.target.value)
		{
			return;
		}

		if(!this.args.controllable[ event.target.value ])
		{
			return;
		}

		const actor = this.args.controllable[ event.target.value ];

		this.nextControl = Bindable.make(actor);

		this.tags.viewport.focus();
	}

	reset()
	{
		this.stop();

		for(const i in this.actors.list)
		{
			const actor = this.actors.list[i];

			this.actors.remove(actor);
		}

		this.actors.remove(this.controlActor);

		this.spawn.clear();
		this.actorPointCache.clear();

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.args.populated = false;
		this.controlActor   = null;
		this.args.frameId   = -1;

		this.populateMap();

		this.nextControl = Object.values(this.args.actors)[0];

		this.tags.viewport.focus();

		this.startTime = Date.now();
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

			console.log(replay);

			localStorage.setItem('replay', replay);
		}

		this.args.isRecording = false;
	}
}
