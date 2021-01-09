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

import { Eggman     } from '../actor/Eggman';
import { Eggrobo     } from '../actor/Eggrobo';
import { MechaSonic } from '../actor/MechaSonic';

import { Sonic }      from '../actor/Sonic';
import { Tails }      from '../actor/Tails';
import { Knuckles }   from '../actor/Knuckles';

import { CharacterString } from '../ui/CharacterString';
import { HudFrame } from '../ui/HudFrame';

import { Layer } from './Layer';

const objectPalette = {
	player: PointActor
	, spring: Spring
	, 'layer-switch': LayerSwitch
	, 'star-post': StarPost
	, 'q-block': QuestionBlock
	, 'projectile': Projectile
	, 'sonic': Sonic
	, 'tails': Tails
	, 'knuckles': Knuckles
	, 'mecha-sonic': MechaSonic
	, 'eggman': Eggman
	, 'eggrobo': Eggrobo
	, 'window': Window
	, 'emerald': Emerald
	, 'ring':    Ring
	, 'coin':    Coin
};

const ColCellsNear = Symbol('collision-cells-near');
const ColCell = Symbol('collision-cell');

export class Viewport extends View
{
	template  = require('./viewport.html');

	constructor(args,parent)
	{
		super(args,parent)
		// this.hud = new Hud
		this.sprites = new Bag;
		this.tileMap = new TileMap;
		this.world   = null;

		this.args.yOffsetTarget = 0.75;
		this.args.yOffset = 0.5;

		this.args.status  = new CharacterString({value:'', scale: 2});
		this.args.focusMe = new CharacterString({value:'', scale: 2});

		this.args.labelX = new CharacterString({value:'x pos: '});
		this.args.labelY = new CharacterString({value:'y pos: '});

		this.args.labelGround = new CharacterString({value:'Grounded: '});
		this.args.labelAngle  = new CharacterString({value:'Gnd theta: '});
		this.args.labelGSpeed = new CharacterString({value:'speed: '});
		this.args.labelXSpeed = new CharacterString({value:'X air spd: '});
		this.args.labelYSpeed = new CharacterString({value:'Y air spd: '});
		this.args.labelMode   = new CharacterString({value:'Mode: '});
		this.args.labelFps    = new CharacterString({value:'FPS: '});

		this.args.labelAirAngle  = new CharacterString({value:'Air theta: '});

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

		this.args.bindTo('fps', v => this.args.fpsSprite.args.value = Number(v).toFixed(2) );

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

		// this.args.width  = 32 * 10.5;
		// this.args.height = 32 * 7;
		// this.args.scale  = 2;

		this.args.x = this.args.x || 0;
		this.args.y = this.args.y || 0;

		this.args.layers = [];

		this.args.animation = '';

		this.spawn = new Set;

		this.actors = new Bag((i,s,a) => {
			if(a == Bag.ITEM_ADDED)
			{
				i.viewport = this;
				this.setColCell(i);
			}
			else if(a == Bag.ITEM_REMOVED)
			{
				i.viewport = null;

				if(i[ColCell])
				{
					i[ColCell].delete(i);
				}

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
		 	? this.args.width / 2
		 	: this.args.height / 2;

		this.colCells   = {};

		this.actorPointCache = new Map;

		this.startTime = null;

		this.args.audio = true;

		this.nextControl = false;

		this.updateStarted = new Set;
		this.updateEnded = new Set;
		this.updated = new Set;
	}

	fullscreen()
	{
		this.args.focusMe.args.hide = 'hide';
		this.initScale = this.args.scale;

		this.tags.viewport.requestFullscreen().then(res=>{
			requestAnimationFrame(()=>{

				const hScale = window.innerHeight / this.args.height;
				const vScale = window.innerWidth / this.args.width;

				this.args.scale = hScale > vScale ? hScale : vScale;
				this.args.fullscreen = 'fullscreen';

				this.args.status.args.value = ' hit escape to revert. ';

				this.args.status.args.hide  = '';

				this.onTimeout(2500, ()=>{
					this.args.focusMe.args.hide = '';
					this.args.status.args.hide  = 'hide';
				});
			});
		});
	}

	onAttached(event)
	{
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

						this.args.focusMe.args.value = ' Click here for keyboard control. ';
						this.args.status.args.hide = '';

						this.onTimeout(750, () => {
							this.args.animation = 'closed';
							this.tags.viewport.focus();
						});

						this.onTimeout(500, () => {
							this.args.paused = false;
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

	takeKeyboardInput()
	{
		const keyboard = Keyboard.get();

		if(keyboard.getKey('Shift') > 0)
		{
			this.controlActor.running  = false;
			this.controlActor.crawling = true;
		}
		else if(keyboard.getKey('Control') > 0)
		{
			this.controlActor.running  = true;
			this.controlActor.crawling = false;
		}

		if(keyboard.getKey('ArrowLeft') > 0 || keyboard.getKey('a') > 0)
		{
			this.controlActor.xAxis = -1;
		}
		else if(keyboard.getKey('ArrowRight') > 0 || keyboard.getKey('d') > 0)
		{
			this.controlActor.xAxis = 1;
		}
		else if(keyboard.getKey('ArrowUp') > 0 || keyboard.getKey('w') > 0)
		{
			if(this.controlActor.args.mode === 1)
			{
				this.controlActor.xAxis = -1;
			}
			else if(this.controlActor.args.mode === 3)
			{
				this.controlActor.xAxis = 1;
			}
		}
		else if(keyboard.getKey('ArrowDown') > 0 || keyboard.getKey('s') > 0)
		{
			if(this.controlActor.args.mode === 1)
			{
				this.controlActor.xAxis = 1;
			}
			else if(this.controlActor.args.mode === 3)
			{
				this.controlActor.xAxis = -1;
			}
		}

		if(keyboard.getKey(' ') > 0)
		{
			this.controlActor.command_0(); // jump
		}
	}

	takeGamepadInput()
	{
		if(!this.gamepad)
		{
			return;
		}

		const gamepads = navigator.getGamepads();

		for(let i = 0; i < gamepads.length; i++)
		{
			const gamepad = gamepads.item(i);

			if(!gamepad)
			{
				continue;
			}

			if(gamepad.axes[0] && Math.abs(gamepad.axes[0]) > 0.3)
			{
				this.controlActor.xAxis = gamepad.axes[0];
			}
			else if(gamepad.axes[1] && Math.abs(gamepad.axes[1]) > 0.3)
			{
				if(this.controlActor.args.mode === 1)
				{
					this.controlActor.xAxis = gamepad.axes[1];
				}
				else if(this.controlActor.args.mode === 3)
				{
					this.controlActor.xAxis = gamepad.axes[1];
				}
			}
			else
			{
				this.controlActor.xAxis = 0;
			}

			if(gamepad.buttons[14].pressed)
			{
				this.controlActor.xAxis = -1;
			}
			else if(gamepad.buttons[15].pressed)
			{
				this.controlActor.xAxis = 1;
			}
			else if(gamepad.buttons[12].pressed)
			{
				if(this.controlActor.args.mode === 1)
				{
					this.controlActor.xAxis = -1;
				}
				else if(this.controlActor.args.mode === 3)
				{
					this.controlActor.xAxis = 1;
				}
			}
			else if(gamepad.buttons[13].pressed)
			{
				if(this.controlActor.args.mode === 1)
				{
					this.controlActor.xAxis = 1;
				}
				else if(this.controlActor.args.mode === 3)
				{
					this.controlActor.xAxis = -1;
				}
			}

			if(gamepad.buttons[5].pressed)
			{
				this.controlActor.running  = false;
				this.controlActor.crawling = true;
			}
			else if(gamepad.buttons[1].pressed || gamepad.buttons[4].pressed)
			{
				this.controlActor.running  = true;
				this.controlActor.crawling = false;
			}


			if(gamepad.buttons[0].pressed)
			{
				this.controlActor.command_0 && this.controlActor.command_0(); // jump
			}

			if(gamepad.buttons[2].pressed)
			{
				this.controlActor.command_2 && this.controlActor.command_2(); // shoot
			}
		}
	}

	moveCamera()
	{
		let cameraSpeed = 15;

		if(this.controlActor.args.falling)
		{
			this.args.yOffsetTarget = 0.5;
			cameraSpeed = 25;

		}
		else if(this.controlActor.args.mode === 2)
		{
			if(this.controlActor.args.cameraMode = 'normal')
			{
				this.args.yOffsetTarget = 0.25;
				cameraSpeed = 5;
			}
			else
			{
				this.args.yOffsetTarget = 0.5;
				cameraSpeed = 5;

			}
		}
		else if(this.controlActor.args.mode)
		{
			this.args.yOffsetTarget = 0.5;
		}
		else
		{
			this.args.yOffsetTarget = 0.75;
		}

		this.args.x = -this.controlActor.x + this.args.width  * 0.5;
		this.args.y = -this.controlActor.y + this.args.height * this.args.yOffset;

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
			transform: `translate(calc(1px * ${xMod}), calc(1px * ${yMod}))`
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

			const objArgs = {
				x: objDef.x + 16
				, y: objDef.y - 1
				, visible: objDef.visible
			};

			for(const i in objDef.properties)
			{
				const property = objDef.properties[i];

				objArgs[ property.name ] = property.value;
			}

			const obj = new objClass(Object.assign({}, objArgs));

			this.actors.add( obj );
		}

		this.actors.add( new TextActor({x: 1250, y:1800}) );
	}

	spawnActors()
	{
		const idle = window.requestIdleCallback || window.requestAnimationFrame;

		for(const spawn of this.spawn.values())
		{
			if(spawn.time < Date.now())
			{
				this.spawn.delete(spawn);
				idle(()=>this.actors.add(spawn.object));
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

				actor.args.display = 'inital';
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

				const actorX = actor.x + x - (width / 2);
				const actorY = actor.y + y - (height / 2);

				if(Math.abs(actorX) > width)
				{
					actor.args.display = 'none';
				}

				if(Math.abs(actorY) > height)
				{
					actor.args.display = 'none';
				}

				this.updateEnded.add(actor);
			}
		}
	}

	update()
	{
		const time    = (Date.now() - this.startTime) / 1000;
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

		const actors = this.actors.list;

		this.controlActor = this.controlActor || actors[0];

		if(!this.args.maxSpeed)
		{
			this.args.maxSpeed = this.controlActor.args.gSpeedMax;
		}

		this.controlActor.args.gSpeedMax = this.args.maxSpeed;

		this.controlActor.args.display = 'inital';

		this.controlActor.willStick = !!this.args.willStick;
		this.controlActor.stayStuck = !!this.args.stayStuck;

		this.controlActor.xAxis     = 0;
		this.controlActor.running   = false;
		this.controlActor.crawling  = false;

		this.updateStarted.clear();
		this.updated.clear();
		this.updateEnded.clear();

		this.takeGamepadInput();

		this.takeKeyboardInput();

		this.controlActor.updateStart();

		this.updateStarted.add(this.controlActor);

		const nearbyCells = this.getNearbyColCells(this.controlActor);

		this.actorUpdateStart(nearbyCells);

		this.controlActor.update();

		this.updated.add(this.controlActor);

		this.actorUpdate(nearbyCells);

		this.moveCamera();

		this.updateBackground();

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

		this.args.xPos.args.value     = Math.round(this.controlActor.x);
		this.args.yPos.args.value     = Math.round(this.controlActor.y);
		this.args.ground.args.value   = this.controlActor.args.landed;
		this.args.gSpeed.args.value   = this.controlActor.args.gSpeed.toFixed(2);
		this.args.xSpeed.args.value   = Math.round(this.controlActor.args.xSpeed);
		this.args.ySpeed.args.value   = Math.round(this.controlActor.args.ySpeed);
		this.args.angle.args.value    = (Math.round((this.controlActor.args.angle) * 1000) / 1000).toFixed(3);
		this.args.airAngle.args.value = (Math.round((this.controlActor.args.airAngle) * 1000) / 1000).toFixed(3);

		const modes = ['FLOOR', 'L-WALL', 'CEILING', 'R-WALL'];

		this.args.mode.args.value = modes[Math.floor(this.controlActor.args.mode)] || Math.floor(this.controlActor.args.mode);

		this.controlActor.updateEnd();

		this.updateEnded.add(this.controlActor);

		this.actorUpdateEnd(nearbyCells);

		this.spawnActors();

		if(this.nextControl)
		{
			this.controlActor  = this.nextControl;
			this.args.maxSpeed = null;
			this.nextControl   = null;
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
				const offset = Math.floor(actor.args.width / 2);

				const left   = -offset + actor.args.x;
				const right  = -offset + actor.args.x + actor.args.width;

				const top    = actor.args.y - actor.args.height;
				const bottom = actor.args.y;

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

		if(actor[ColCell] && actor[ColCell] !== cell)
		{
			actor[ColCell].delete(actor);
		}

		actor[ColCell] = cell;

		actor[ColCell].add(actor);

		return cell;
	}

	getNearbyColCells(actor)
	{
		const colCellDiv = this.colCellDiv
		const cellX = Math.floor( actor.x / colCellDiv );
		const cellY = Math.floor( actor.y / colCellDiv );

		const name = `${cellX}::${cellY}`;

		if(this.colCellCache[name])
		{
			return this.colCellCache[name].filter(set=>set.size);
		}

		const space = colCellDiv;

		this.colCellCache[name] = [
			  this.getColCell({x:actor.x - space, y:actor.y - space})
			, this.getColCell({x:actor.x - space, y:actor.y})
			, this.getColCell({x:actor.x - space, y:actor.y + space})

			, this.getColCell({x:actor.x, y:actor.y - space})
			, this.getColCell({x:actor.x, y:actor.y})
			, this.getColCell({x:actor.x, y:actor.y + space})

			, this.getColCell({x:actor.x + space, y:actor.y - space})
			, this.getColCell({x:actor.x + space, y:actor.y})
			, this.getColCell({x:actor.x + space, y:actor.y + space})
		]

		return this.colCellCache[name].filter(set=>set.size);
	}
}
