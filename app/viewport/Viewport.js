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
import { PointActor } from '../actor/PointActor';
import { Explosion } from '../actor/Explosion';
import { Monitor } from '../actor/Monitor';
import { Spring } from '../actor/Spring';
import { Ring } from '../actor/Ring';
import { Coin } from '../actor/Coin';

import { CharacterString } from '../ui/CharacterString';
import { HudFrame } from '../ui/HudFrame';

import { Layer } from './Layer';

const objectPalette = {
	player: PointActor
	, spring: Spring
	, 'layer-switch': LayerSwitch
	, 'q-block': QuestionBlock
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

		this.args.maxSpeed = 0;

		this.args.status = new CharacterString({value:'', scale: 2});

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
		this.args.gSpeed = new CharacterString({value:0, high: 200, med: 100, low: 25});
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

		this.args.timer = new HudFrame({value:new CharacterString({value:'00:00.000'})});
		this.args.rings = new HudFrame({value:this.rings, type: 'ring-frame'});
		this.args.coins = new HudFrame({value:this.coins, type: 'coin-frame'});

		this.args.blockSize = 32;

		this.args.willStick = false;
		this.args.stayStuck = false;

		this.args.willStick = true;
		this.args.stayStuck = true;

		this.args.width  = 32 * 10.5;
		this.args.height = 32 * 7;
		this.args.scale  = 2;

		this.args.x = 0;
		this.args.y = 0;

		this.args.layers = [];

		this.args.animation = '';

		this.spawn = new Set;

		this.actors = new Bag((i,s,a) => {
			if(a == Bag.ITEM_ADDED)
			{
				i.viewport = this;
				i.args.display = 'none';

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
		this.colCellDiv = 192;
		this.colCells   = {};

		this.actorPointCache = new Map;

		this.startTime = null;
	}

	fullscreen()
	{
		this.initScale = this.args.scale;

		this.tags.viewport.requestFullscreen().then(res=>{
			requestAnimationFrame(()=>{
				const hScale = window.innerHeight / this.args.height;
				const vScale = window.innerWidth / this.args.width;

				this.args.scale = hScale > vScale ? hScale : vScale;
			});
		});
	}

	onAttached(event)
	{
		this.listen(document, 'fullscreenchange', (event) => {
			if (!document.fullscreenElement)
			{
				this.args.scale = this.initScale;
			}
		});

		this.tags.frame.style({
			'--width': this.args.width
			, '--height': this.args.height
			, '--scale': this.args.scale
		});

		this.update();

		this.args.paused = true;

		this.args.status.args.hide = 'hide';

		this.args.animation = 'start';

		this.onTimeout(250, () => {

			this.args.animation = '';

			this.onTimeout(750, () => {
				this.args.animation = 'opening';
				this.tags.viewport.focus();

				this.onTimeout(500, () => {
					this.args.animation = 'opening2';
					this.tags.viewport.focus();

					this.update();

					this.onTimeout(1500, () => {
						this.args.animation = 'closing';
						this.tags.viewport.focus();

						this.args.status.args.value = ' Click here for keyboard control. ';
						this.args.status.args.hide = '';

						this.onTimeout(500, () => {
							this.args.animation = 'closed';
							this.tags.viewport.focus();
						});

						this.onTimeout(250, () => {
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

	update()
	{
		if(!this.startTime)
		{
			this.startTime = Date.now();
		}

		const time    = (Date.now() - this.startTime) / 1000;
		const minutes = String(Math.floor(time / 60)).padStart(2,'0')
		const seconds = String((time % 60).toFixed(2)).padStart(5,'0');

		this.args.timer.args.value.args.value = `${minutes}:${seconds}`;

		this.actorPointCache.clear();

		if(this.args.paused)
		{
			this.tags.frame.style({'--scale': this.args.scale, '--width': this.args.width});

			return;
		}

		// this.args.type === 'actor-item actor-question-block' && console.log(this.viewport.args.x);

		const actors = this.actors.list;

		if(!actors.length)
		{
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
		}

		if(!this.args.maxSpeed)
		{
			this.args.maxSpeed = actors[0].args.maxGSpeed;
		}

		actors[0].args.maxGSpeed = this.args.maxSpeed;
		actors[0].willStick = !!this.args.willStick;
		actors[0].stayStuck = !!this.args.stayStuck;

		actors[0].xAxis = 0;

		actors[0].running  = false;
		actors[0].crawling = false;

		if(this.gamepad)
		{
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
					actors[0].xAxis = gamepad.axes[0];
				}
				else if(gamepad.axes[1] && Math.abs(gamepad.axes[1]) > 0.3)
				{
					if(actors[0].args.mode === 1)
					{
						actors[0].xAxis = gamepad.axes[1];
					}
					else if(actors[0].args.mode === 3)
					{
						actors[0].xAxis = gamepad.axes[1];
					}
				}
				else
				{
					actors[0].xAxis = 0;
				}

				if(gamepad.buttons[14].pressed)
				{
					actors[0].xAxis = -1;
				}
				else if(gamepad.buttons[15].pressed)
				{
					actors[0].xAxis = 1;
				}
				else if(gamepad.buttons[12].pressed)
				{
					if(actors[0].args.mode === 1)
					{
						actors[0].xAxis = -1;
					}
					else if(actors[0].args.mode === 3)
					{
						actors[0].xAxis = 1;
					}
				}
				else if(gamepad.buttons[13].pressed)
				{
					if(actors[0].args.mode === 1)
					{
						actors[0].xAxis = 1;
					}
					else if(actors[0].args.mode === 3)
					{
						actors[0].xAxis = -1;
					}
				}

				if(gamepad.buttons[5].pressed)
				{
					actors[0].running  = false;
					actors[0].crawling = true;
				}
				else if(gamepad.buttons[1].pressed || gamepad.buttons[4].pressed)
				{
					actors[0].running  = true;
					actors[0].crawling = false;
				}


				if(gamepad.buttons[0].pressed)
				{
					actors[0].jump(Date.now());
				}
			}
		}

		if(Keyboard.get().getKey('Shift') > 0)
		{
			actors[0].running  = false;
			actors[0].crawling = true;
		}
		else if(Keyboard.get().getKey('Control') > 0)
		{
			actors[0].running  = true;
			actors[0].crawling = false;
		}

		if(Keyboard.get().getKey('ArrowLeft') > 0 || Keyboard.get().getKey('a') > 0)
		{
			actors[0].xAxis = -1;
		}
		else if(Keyboard.get().getKey('ArrowRight') > 0 || Keyboard.get().getKey('d') > 0)
		{
			actors[0].xAxis = 1;
		}
		else if(Keyboard.get().getKey('ArrowUp') > 0 || Keyboard.get().getKey('w') > 0)
		{
			if(actors[0].args.mode === 1)
			{
				actors[0].xAxis = -1;
			}
			else if(actors[0].args.mode === 3)
			{
				actors[0].xAxis = 1;
			}
		}
		else if(Keyboard.get().getKey('ArrowDown') > 0 || Keyboard.get().getKey('s') > 0)
		{
			if(actors[0].args.mode === 1)
			{
				actors[0].xAxis = 1;
			}
			else if(actors[0].args.mode === 3)
			{
				actors[0].xAxis = -1;
			}
		}

		if(Keyboard.get().getKey('PageUp'))
		{
			actors[0].args.layer = 1;
		}
		else if(Keyboard.get().getKey('PageDown'))
		{
			actors[0].args.layer = 2;
		}

		if(Keyboard.get().getKey(' ') > 0)
		{
			actors[0].jump();
		}

		const angle = actors[0].angle;

		actors[0].updateStart();

		const nearbyCells = this.getNearbyColCells(actors[0]);

		for(const i in nearbyCells)
		{
			const cell   = nearbyCells[i];
			const actors = cell.values();

			for(const actor of actors)
			{
				actor.args.display = 'inital';
				actor.updateStart();
			}
		}

		actors[0].update();

		for(const i in nearbyCells)
		{
			const cell   = nearbyCells[i];
			const actors = cell.values();

			for(const actor of actors)
			{
				actor.update();

				this.setColCell(actor);
			}
		}

		let cameraSpeed = 5;

		if(actors[0].args.falling)
		{
			this.args.yOffsetTarget = 0.5;
			cameraSpeed = 25;

		}
		else if(actors[0].args.mode === 2)
		{
			if(actors[0].args.cameraMode = 'normal')
			{
				this.args.yOffsetTarget = 0.25;
				cameraSpeed = 1;
			}
			else
			{
				this.args.yOffsetTarget = 0.5;
				cameraSpeed = 4;

			}
		}
		else if(actors[0].args.mode)
		{
			this.args.yOffsetTarget = 0.5;
		}
		else
		{
			this.args.yOffsetTarget = 0.75;
		}

		this.args.x = -actors[0].x + this.args.width  * 0.5;
		this.args.y = -actors[0].y + this.args.height * this.args.yOffset;

		if(Math.abs(this.args.yOffsetTarget - this.args.yOffset) < 0.01)
		{
			this.args.yOffset = this.args.yOffsetTarget
		}
		else
		{
			this.args.yOffset += ((this.args.yOffsetTarget - this.args.yOffset) / cameraSpeed);
		}

		if(this.args.x > 0)
		{
			this.args.x = 0;
		}

		if(this.args.y > 0)
		{
			this.args.y = 0;
		}

		const xMax = -(this.tileMap.mapData.width * 32) + this.args.width;
		const yMax = -(this.tileMap.mapData.height * 32) + this.args.height; + 92

		if(this.args.x < xMax)
		{
			this.args.x = xMax;
		}

		if(this.args.y < yMax)
		{
			this.args.y = yMax;
		}

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

		this.rings.args.value = actors[0].args.rings;
		this.coins.args.value = actors[0].args.coins;

		this.args.hasRings = !!actors[0].args.rings;
		this.args.hasCoins = !!actors[0].args.coins;

		this.args.xPos.args.value     = Math.round(actors[0].x);
		this.args.yPos.args.value     = Math.round(actors[0].y);
		this.args.ground.args.value   = actors[0].args.landed;
		this.args.gSpeed.args.value   = actors[0].args.gSpeed.toFixed(2);
		this.args.xSpeed.args.value   = Math.round(actors[0].args.xSpeed);
		this.args.ySpeed.args.value   = Math.round(actors[0].args.ySpeed);
		this.args.angle.args.value    = (Math.round((actors[0].args.angle) * 1000) / 1000).toFixed(3);
		this.args.airAngle.args.value = (Math.round((actors[0].args.airAngle) * 1000) / 1000).toFixed(3);

		const modes = ['FLOOR', 'L-WALL', 'CEILING', 'R-WALL'];

		this.args.mode.args.value = modes[Math.floor(actors[0].args.mode)] || Math.floor(actors[0].args.mode);

		actors[0].updateEnd();

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
			}
		}

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
			return this.colCellCache[name];
		}

		return this.colCellCache[name] = [
			this.getColCell({x:actor.x-colCellDiv, y:actor.y-colCellDiv})
			, this.getColCell({x:actor.x-colCellDiv, y:actor.y+0})
			, this.getColCell({x:actor.x-colCellDiv, y:actor.y+colCellDiv})

			, this.getColCell({x:actor.x, y:actor.y-colCellDiv})
			, this.getColCell({x:actor.x, y:actor.y+0})
			, this.getColCell({x:actor.x, y:actor.y+colCellDiv})

			, this.getColCell({x:actor.x+colCellDiv, y:actor.y-colCellDiv})
			, this.getColCell({x:actor.x+colCellDiv, y:actor.y+0})
			, this.getColCell({x:actor.x+colCellDiv, y:actor.y+colCellDiv})
		].filter(set=>{

			return set.size;

		});
	}
}
