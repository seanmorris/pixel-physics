import { Bag  } from 'curvature/base/Bag';
import { Tag  } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

import { Keyboard } from 'curvature/input/Keyboard';

import { Camera } from './Camera';

import { Actor   } from '../actor/Actor';
import { PointActor } from '../actor/PointActor';
import { TileMap } from '../tileMap/TileMap';

import { PointDump } from '../debug/PointDump';

export class Viewport extends View
{
	template  = require('./viewport.html');

	constructor(args,parent)
	{
		super(args,parent)
		// this.hud = new Hud
		this.camera  = new Camera
		this.sprites = new Bag;
		this.tileMap = new TileMap;
		this.world   = null;

		this.args.blockSize = 32;

		this.args.width  = 32*9;
		this.args.height = 32*6;

		this.args.x = 0;
		this.args.y = 0;

		this.args.offsetX = 0;
		this.args.offsetY = 0;

		this.blocksXY = {};

		const actor = new PointActor;

		actor.viewport = this;

		this.args.actors = [ actor ];

		this.blocks = new Bag;

		this.args.blocks = this.blocks.list;
	}

	onAttached(event)
	{
		const keyboard = Keyboard.get();

		keyboard.listening = true;
	}

	mousemove(event)
	{
		// this.args.x = event.clientX;
		// this.args.y = event.clientY;
	}

	update()
	{
		const maxSpeed = 64;

		if(Keyboard.get().getKey(' ') > 0)
		{
			this.args.actors[0].jump();
		}

		if(Keyboard.get().getKey('Control') > 0)
		{
			this.args.actors[0].running  = true;
			this.args.actors[0].crawling = false;
		}
		else if(Keyboard.get().getKey('Shift') > 0)
		{
			this.args.actors[0].running  = false;
			this.args.actors[0].crawling = true;
		}
		else
		{
			this.args.actors[0].running  = false;
			this.args.actors[0].crawling = false;
		}

		// if(Keyboard.get().getKey('ArrowUp') > 0)
		// {
		// 	this.args.actors[0].goUp();
		// }
		// else if(Keyboard.get().getKey('ArrowDown') > 0)
		// {
		// 	this.args.actors[0].goDown();
		// }

		if(Keyboard.get().getKey('ArrowLeft') > 0)
		{
			this.args.actors[0].xAxis = -1;
		}
		else if(Keyboard.get().getKey('ArrowRight') > 0)
		{
			this.args.actors[0].xAxis = 1;
		}
		else
		{
			this.args.actors[0].xAxis = 0;
		}

		for(const i in this.args.actors)
		{
			this.args.actors[i].update();
		}

		const angle = this.args.actors[0].angle;

		this.args.x = -this.args.actors[0].x + 160;
		this.args.y = -this.args.actors[0].y + 128;

		if(this.args.x > 0)
		{
			this.args.x = 0;
		}

		if(this.args.y > 0)
		{
			this.args.y = 0;
		}

		const blocksWide = Math.ceil((this.args.width  / this.args.blockSize));
		const blocksHigh = Math.ceil((this.args.height / this.args.blockSize));

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

				// block.innerText = blockId || '';

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

				block.style({
					'background-position': -1*(tileXY[0]*this.args.blockSize)
						+ 'px '
						+ -1*(tileXY[1]*this.args.blockSize)
						+ 'px'
				});
			}
		}

		this.tags.viewport.style({
			'--x': Math.round(this.args.x)
			, '--y': Math.round(this.args.y)
			, '--xMod': Math.round(this.args.x % this.args.blockSize)
			, '--yMod': Math.round(this.args.y % this.args.blockSize)
			, '--width': this.args.width
			, '--height': this.args.height
		});
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
}
