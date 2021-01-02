import { Bag  } from 'curvature/base/Bag';
import { Tag  } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

import { Keyboard } from 'curvature/input/Keyboard';

// import { Actor   } from '../actor/Actor';
import { TileMap } from '../tileMap/TileMap';

import { QuestionBlock } from '../actor/QuestionBlock';
import { BrokenMonitor } from '../actor/BrokenMonitor';
import { PointActor } from '../actor/PointActor';
import { Explosion } from '../actor/Explosion';
import { Monitor } from '../actor/Monitor';
import { Ring } from '../actor/Ring';

import { CharacterString } from '../ui/CharacterString';

import { PointDump } from '../debug/PointDump';

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

		this.args.status = new CharacterString({value:'', scale: 2});

		this.args.labelX = new CharacterString({value:'x pos: '});
		this.args.labelY = new CharacterString({value:'y pos: '});

		this.args.labelGround = new CharacterString({value:'Ground: '});
		this.args.labelGSpeed = new CharacterString({value:'G speed: '});
		this.args.labelXSpeed = new CharacterString({value:'X speed: '});
		this.args.labelYSpeed = new CharacterString({value:'Y speed: '});
		this.args.labelMode   = new CharacterString({value:'Mode: '});
		this.args.labelAngle  = new CharacterString({value:'G Angle: '});

		this.args.labelAirAngle  = new CharacterString({value:'Air Angle: '});

		this.args.xPos   = new CharacterString({value:0});
		this.args.yPos   = new CharacterString({value:0});
		this.args.gSpeed = new CharacterString({value:0});
		this.args.ground = new CharacterString({value:''});
		this.args.xSpeed = new CharacterString({value:0});
		this.args.ySpeed = new CharacterString({value:0});
		this.args.mode   = new CharacterString({value:0});
		this.args.angle  = new CharacterString({value:0});

		this.args.airAngle  = new CharacterString({value:0});

		this.args.blockSize = 32;

		this.args.willStick = false;
		this.args.stayStuck = false;

		this.args.willStick = true;
		this.args.stayStuck = true;

		this.args.width  = 32 * 12.5;
		this.args.height = 32 * 8.5;
		this.args.scale  = 2;

		this.args.x = 0;
		this.args.y = 0;

		this.args.offsetX = 0;
		this.args.offsetY = 0;

		this.blocksXY = {};

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
					console.log(i[ColCell]);
					i[ColCell].delete(i);
				}

			}
		});

		const actor = new PointActor({x: 1280, y: 96});

		const monitor = new Monitor({x: 1328, y: 96 });
		const monitor2 = new Monitor({x: 1392, y: 208, float: -1 });
		const explosion = new Explosion({x: 1440, y: 224, float: -1 });

		const questionBlock = new QuestionBlock({x: 1328, y: 224 });

		const ring6 = new Ring({x: 1456, y: 287 });
		const ring5 = new Ring({x: 1424, y: 287 });
		const ring4 = new Ring({x: 1392, y: 287 });

		const ring3 = new Ring({x: 1184, y: 191 });
		const ring2 = new Ring({x: 1216, y: 191 });
		const ring1 = new Ring({x: 1248, y: 191 });

		this.actors.add( actor );
		this.actors.add( questionBlock );
		this.actors.add( monitor );
		this.actors.add( monitor2 );
		this.actors.add( ring1 );
		this.actors.add( ring2 );
		this.actors.add( ring3 );
		this.actors.add( ring4 );
		this.actors.add( ring5 );
		this.actors.add( ring6 );

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

		this.colCellDiv = 64;
		this.colCells   = {};
	}

	onAttached(event)
	{
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
		if(this.args.paused)
		{
			this.tags.frame.style({'--scale': this.args.scale, '--width': this.args.width});

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
					this.args.actors[0].xAxis = gamepad.axes[0] > 0 ? 1 : -1;
				}
				else if(gamepad.axes[1] && Math.abs(gamepad.axes[1]) > 0.3)
				{
					if(this.args.actors[0].args.mode === 1)
					{
						this.args.actors[0].xAxis = gamepad.axes[1] > 0 ? 1 : -1;
					}
					else if(this.args.actors[0].args.mode === 3)
					{
						this.args.actors[0].xAxis = gamepad.axes[1] > 0 ? -1 : 1;
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


		if(Keyboard.get().getKey(' ') > 0)
		{
			this.args.actors[0].jump();
		}

		const angle = this.args.actors[0].angle;

		const blocksWide = Math.ceil((this.args.width  / this.args.blockSize));
		const blocksHigh = Math.ceil((this.args.height / this.args.blockSize));

		for(const i in this.args.actors)
		{
			const actor = this.args.actors[i];

			this.setColCell(actor);

			actor.updateStart();
		}

		for(const i in this.args.actors)
		{
			const actor = this.args.actors[i];

			actor.update();
		}

		this.args.x = -this.args.actors[0].x + this.args.width  * 0.5;
		this.args.y = -this.args.actors[0].y + this.args.height * 0.66;

		if(this.args.x > 0)
		{
			this.args.x = 0;
		}

		if(this.args.y > 0)
		{
			this.args.y = 0;
		}

		const xMax = -(this.tileMap.mapData.width * 32) + this.args.width;
		const yMax = -(this.tileMap.mapData.height * 32) + this.args.height;

		if(this.args.x < xMax)
		{
			this.args.x = xMax;
		}

		if(this.args.y < yMax)
		{
			this.args.y = yMax;
		}

		for(var i = -1; i <= blocksWide + 1; i++)
		{
			for(var j = -1; j <= blocksHigh + 1; j++)
			{
				if(!this.blocksXY[i])
				{
					this.blocksXY[i] = {};
				}

				if(!this.blocksXY[i][j])
				{
					this.blocksXY[i][j] = new Tag('<div>');
				}

				let block = this.blocksXY[i][j];

				const blockId = this.tileMap.getTileNumber(
					this.args.offsetX
						+ i
						- Math.ceil(this.args.x / this.args.blockSize)
						+ 0
					, this.args.offsetY
						+ j
						- Math.ceil(this.args.y / this.args.blockSize)
						+ 0
				);

				const tileXY = this.tileMap.getTile(blockId);

				if(!this.blocks.has(block))
				{
					block.style({
						width: this.args.blockSize + 'px'
						, height: this.args.blockSize + 'px'
					});

					const transX = this.args.blockSize * i
						+ (this.args.offsetX * this.args.blockSize)
						% this.args.blockSize;

					const transY = this.args.blockSize * j
						+ (this.args.offsetY * this.args.blockSize)
						% this.args.blockSize;

					block.style({
						transform: `translate(${transX}px, ${transY}px)`
						, 'background-image': 'url(/Sonic/testTiles2.png)'
						, 'background-position': -1*(tileXY[0]*this.args.blockSize)
							+ 'px '
							+ -1*(tileXY[1]*this.args.blockSize)
							+ 'px'
						, position: 'absolute'
						, left: 0
						, top: 0
					});

					this.blocks.add(block);
				}

				const blockOffset = -1*(tileXY[0]*this.args.blockSize)
					+ 'px '
					+ -1*(tileXY[1]*this.args.blockSize)
					+ 'px';

				if(block.blockOffset !== blockOffset)
				{
					block.style({'background-position': blockOffset});
				}

				block.blockOffset = blockOffset;
			}
		}

		this.tags.frame.style({
			'--x': Math.round(this.args.x)
			, '--y': Math.round(this.args.y)
			, '--xMod': this.args.x < 0
				? Math.round(this.args.x % (this.args.blockSize))
				: (-this.args.blockSize + Math.round(this.args.x % this.args.blockSize)) % this.args.blockSize
			, '--yMod':  this.args.y < 0
				? Math.round(this.args.y % (this.args.blockSize))
				: (-this.args.blockSize + Math.round(this.args.y % this.args.blockSize)) % this.args.blockSize
			, '--width': this.args.width
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
		const actors = [];

		const cells = this.getNearbyColCells({x,y});

		for(const i in cells)
		{
			const cell = cells[i];

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
		}

		// for(let i in this.args.actors)
		// {
		// 	const actor = this.args.actors[i];

		// 	const offset = Math.floor(actor.args.width / 2);

		// 	const left   = -offset + actor.args.x;
		// 	const right  = -offset + actor.args.x + actor.args.width;

		// 	const top    = actor.args.y - actor.args.height;
		// 	const bottom = actor.args.y;

		// 	if(x >= left && right > x)
		// 	{
		// 		if(bottom >= y && y > top)
		// 		{
		// 			actors.push( actor );
		// 		}
		// 	}
		// }

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

	colCellAddress({x,y})
	{
		return {x: Math.floor( x / this.colCellDiv ), y: Math.floor( y / this.colCellDiv )};
	}

	getColCell(actor)
	{
		const address = this.colCellAddress(actor);

		this.colCells[address.x] = this.colCells[address.x] || {};

		this.colCells[address.x][address.y] = this.colCells[address.x][address.y] || new Set;

		return this.colCells[address.x][address.y];
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
		return [
			this.getColCell({x:actor.x-this.colCellDiv, y:actor.y-this.colCellDiv})
			, this.getColCell({x:actor.x-this.colCellDiv, y:actor.y+0})
			, this.getColCell({x:actor.x-this.colCellDiv, y:actor.y+this.colCellDiv})

			, this.getColCell({x:actor.x, y:actor.y-this.colCellDiv})
			, this.getColCell({x:actor.x, y:actor.y+0})
			, this.getColCell({x:actor.x, y:actor.y+this.colCellDiv})

			, this.getColCell({x:actor.x+this.colCellDiv, y:actor.y-this.colCellDiv})
			, this.getColCell({x:actor.x+this.colCellDiv, y:actor.y+0})
			, this.getColCell({x:actor.x+this.colCellDiv, y:actor.y+this.colCellDiv})
		];
	}
}
