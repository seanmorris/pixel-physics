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

import { CharacterString } from '../ui/CharacterString';

import { Layer } from './Layer';

const objectPalette = {
	player: PointActor
	, spring: Spring
	, 'layer-switch': LayerSwitch
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

		this.args.blockSize = 32;

		this.args.willStick = false;
		this.args.stayStuck = false;

		this.args.willStick = true;
		this.args.stayStuck = true;

		this.args.width  = 32 * 12;
		this.args.height = 32 * 7;
		this.args.scale  = 2;

		this.args.x = 0;
		this.args.y = 0;

		this.args.layers = [];

		this.args.animation = '';

		this.actors = new Bag((i,s,a) => {
			if(a == Bag.ITEM_ADDED)
			{
				i.viewport = this;
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

		this.args.actors = this.actors.list;

		this.blocks = new Bag;

		this.args.blocks = this.blocks.list;

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
		this.colCellDiv = 256;
		this.colCells   = {};

		this.actorPointCache = new Map;
	}

	fullscreen()
	{
		this.initScale = this.args.scale;

		this.tags.viewport.requestFullscreen().then(res=>{
			requestAnimationFrame(()=>{
				const hScale = window.innerHeight / this.args.height;
				const vScale = window.innerWidth / this.args.width;

				// this.args.scale = hScale > vScale ? hScale : vScale;
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
		this.actorPointCache.clear();

		if(this.args.paused)
		{
			this.tags.frame.style({'--scale': this.args.scale, '--width': this.args.width});

			return;
		}

		if(!this.args.actors.length)
		{
			const objDefs = this.tileMap.getObjectDefs();

			for(let i in objDefs)
			{
				if(this.args.actors.length)
				{
					// continue;
				}

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

			return;
		}

		this.args.actors[0].willStick = !!this.args.willStick;
		this.args.actors[0].stayStuck = !!this.args.stayStuck;

		this.args.actors[0].xAxis = 0;

		this.args.actors[0].running  = false;
		this.args.actors[0].crawling = false;

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
					this.args.actors[0].xAxis = gamepad.axes[0];
				}
				else if(gamepad.axes[1] && Math.abs(gamepad.axes[1]) > 0.3)
				{
					if(this.args.actors[0].args.mode === 1)
					{
						this.args.actors[0].xAxis = gamepad.axes[1];
					}
					else if(this.args.actors[0].args.mode === 3)
					{
						this.args.actors[0].xAxis = gamepad.axes[1];
					}
				}
				else
				{
					this.args.actors[0].xAxis = 0;
				}

				if(gamepad.buttons[14].pressed)
				{
					this.args.actors[0].xAxis = -1;
				}
				else if(gamepad.buttons[15].pressed)
				{
					this.args.actors[0].xAxis = 1;
				}
				else if(gamepad.buttons[12].pressed)
				{
					if(this.args.actors[0].args.mode === 1)
					{
						this.args.actors[0].xAxis = -1;
					}
					else if(this.args.actors[0].args.mode === 3)
					{
						this.args.actors[0].xAxis = 1;
					}
				}
				else if(gamepad.buttons[13].pressed)
				{
					if(this.args.actors[0].args.mode === 1)
					{
						this.args.actors[0].xAxis = 1;
					}
					else if(this.args.actors[0].args.mode === 3)
					{
						this.args.actors[0].xAxis = -1;
					}
				}

				if(gamepad.buttons[5].pressed)
				{
					this.args.actors[0].running  = false;
					this.args.actors[0].crawling = true;
				}
				else if(gamepad.buttons[1].pressed || gamepad.buttons[4].pressed)
				{
					this.args.actors[0].running  = true;
					this.args.actors[0].crawling = false;
				}


				if(gamepad.buttons[0].pressed)
				{
					this.args.actors[0].jump(Date.now());
				}
			}
		}

		if(Keyboard.get().getKey('Shift') > 0)
		{
			this.args.actors[0].running  = false;
			this.args.actors[0].crawling = true;
		}
		else if(Keyboard.get().getKey('Control') > 0)
		{
			this.args.actors[0].running  = true;
			this.args.actors[0].crawling = false;
		}

		if(Keyboard.get().getKey('ArrowLeft') > 0 || Keyboard.get().getKey('a') > 0)
		{
			this.args.actors[0].xAxis = -1;
		}
		else if(Keyboard.get().getKey('ArrowRight') > 0 || Keyboard.get().getKey('d') > 0)
		{
			this.args.actors[0].xAxis = 1;
		}
		else if(Keyboard.get().getKey('ArrowUp') > 0 || Keyboard.get().getKey('w') > 0)
		{
			if(this.args.actors[0].args.mode === 1)
			{
				this.args.actors[0].xAxis = -1;
			}
			else if(this.args.actors[0].args.mode === 3)
			{
				this.args.actors[0].xAxis = 1;
			}
		}
		else if(Keyboard.get().getKey('ArrowDown') > 0 || Keyboard.get().getKey('s') > 0)
		{
			if(this.args.actors[0].args.mode === 1)
			{
				this.args.actors[0].xAxis = 1;
			}
			else if(this.args.actors[0].args.mode === 3)
			{
				this.args.actors[0].xAxis = -1;
			}
		}

		if(Keyboard.get().getKey('PageUp'))
		{
			this.args.actors[0].args.layer = 1;
		}
		else if(Keyboard.get().getKey('PageDown'))
		{
			this.args.actors[0].args.layer = 2;
		}

		if(Keyboard.get().getKey(' ') > 0)
		{
			this.args.actors[0].jump();
		}

		const angle = this.args.actors[0].angle;

		for(const i in this.args.actors)
		{
			const actor = this.args.actors[i];

			this.setColCell(actor);

			actor.updateStart();
		}

		for(const i in this.args.actors)
		{
			const actor = this.args.actors[i];

			if(actor.args.float)
			{
				actor.update();
			}

		}

		for(const i in this.args.actors)
		{
			const actor = this.args.actors[i];

			if(!actor.args.float)
			{
				actor.update();
			}
		}

		let cameraSpeed = 5;

		if(this.args.actors[0].args.falling)
		{
			this.args.yOffsetTarget = 0.5;
			cameraSpeed = 25;

		}
		else if(this.args.actors[0].args.mode === 2)
		{
			if(this.args.actors[0].args.cameraMode = 'normal')
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
		else if(this.args.actors[0].args.mode)
		{
			this.args.yOffsetTarget = 0.5;
		}
		else
		{
			this.args.yOffsetTarget = 0.75;
		}

		this.args.x = -this.args.actors[0].x + this.args.width  * 0.5;
		this.args.y = -this.args.actors[0].y + this.args.height * this.args.yOffset;

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

		this.args.xPos.args.value     = Math.round(this.args.actors[0].x);
		this.args.yPos.args.value     = Math.round(this.args.actors[0].y);
		this.args.ground.args.value   = this.args.actors[0].args.landed;
		this.args.gSpeed.args.value   = this.args.actors[0].args.gSpeed;
		this.args.xSpeed.args.value   = Math.round(this.args.actors[0].args.xSpeed);
		this.args.ySpeed.args.value   = Math.round(this.args.actors[0].args.ySpeed);
		this.args.angle.args.value    = (Math.round((this.args.actors[0].args.angle) * 1000) / 1000).toFixed(3);
		this.args.airAngle.args.value = (Math.round((this.args.actors[0].args.airAngle) * 1000) / 1000).toFixed(3);

		const modes = ['FLOOR', 'L-WALL', 'CEILING', 'R-WALL'];

		this.args.mode.args.value = modes[Math.floor(this.args.actors[0].args.mode)] || Math.floor(this.args.actors[0].args.mode);

		for(const i in this.args.actors)
		{
			const actor = this.args.actors[i];

			actor.updateEnd();
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
