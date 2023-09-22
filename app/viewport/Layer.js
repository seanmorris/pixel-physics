import { Bindable } from 'curvature/base/Bindable';
import { View } from 'curvature/base/View';
import { Tag } from 'curvature/base/Tag';
import { Bag  } from 'curvature/base/Bag';
import { TitleScreenCard } from '../intro/TitleScreenCard';

export class Layer extends View
{
	template  = require('./layer.html');

	constructor(args,parent)
	{
		args[ Bindable.NoGetters ] = true;

		super(args, parent);

		this[ Bindable.NoGetters ] = true;

		this.args.width  = args.width  || 320;
		this.args.height = args.height || 200;

		this.args.blockSize = args.blockSize || 32;

		this.x = 0;
		this.y = 0;

		this.viewport = args.viewport;

		this.hidden = false;

		this.args.offsetX = 0;
		this.args.offsetY = 0;

		this.args.parallax = this.args.parallax || 0;

		this.args.layerId = 0 || this.args.layerId;

		Object.defineProperty(this, 'blocksXY',  {value: new Map});
		Object.defineProperty(this, 'blocks',    {value: new Bag});
		Object.defineProperty(this, 'blockMeta', {value: new Map});
		Object.defineProperty(this, 'blockSrcs', {value: new Map});

		this.args.blocks = this.blocks.list;

		this.meta = Object.create(null);

		const viewport = this.args.viewport;
		const layers   = viewport.tileMap.tileLayers;
		const layerDef = layers[this.args.layerId];

		this.setMeta(layerDef);

		if(this.meta.offsetX)
		{
			this.args.offsetX = this.meta.offsetX;
		}

		if(this.meta.offsetY)
		{
			this.args.offsetY = this.meta.offsetY;
		}

		layerDef['offsetX'] = this.args.offsetX;
		layerDef['offsetY'] = this.args.offsetY;

		layerDef.layer = this;

		// if(this.args.name.match(/^(Collision|Grinding)\s\d+/))
		// {
		// 	if(this.args.name.match(/[12]$/))
		// 	{
		// 		this.meta.switchable = true;
		// 	}

		// 	this.meta.solid = true;
		// }

		if(this.args.name.match(/^(Grinding)\s\d+/))
		{
			this.meta.grinding = true;
		}

		this.offsetXChanged = 0;
		this.offsetYChanged = 0;

		this.fallSpeed      = 0;

		Object.preventExtensions(this);

		const resetBlocks = () => [...this.blockMeta.values()].forEach(b => b.reset = true);

		this.args.bindTo('width',  resetBlocks, {wait:0});
		this.args.bindTo('height', resetBlocks, {wait:0});
	}

	setMeta(layerDef, maxObjectId = 0)
	{
		if(layerDef.properties)
		{
			for(const property of layerDef.properties)
			{
				this.meta[property.name] = property.value;

				if(property.type === 'object')
				{
					this.meta[property.name] += maxObjectId;
				}
			}
		}
	}

	move()
	{
		if(this.meta.controller === undefined)
		{
			return;
		}

		const viewport   = this.args.viewport;
		const layers     = viewport.tileMap.tileLayers;
		const layerDef   = layers[this.args.layerId];
		const controller = viewport.actorsById[ this.meta.controller ];

		this.offsetXChanged = 0;
		this.offsetYChanged = 0;

		if(layerDef)
		{
			layerDef.offsetXChanged = 0;
			layerDef.offsetYChanged = 0;
		}

		if(controller)
		{
			if(layerDef)
			{
				layerDef['offsetX'] = this.args.offsetX;
				layerDef['offsetY'] = this.args.offsetY;
			}

			const changedX = (controller.args.xLayer || 0) - this.args.offsetX;
			const changedY = (controller.args.yLayer || 0) - this.args.offsetY;

			this.args.offsetX = controller.args.xLayer || 0;
			this.args.offsetY = controller.args.yLayer || 0;

			if(layerDef)
			{
				layerDef[`offsetXChanged`] = changedX;
				layerDef[`offsetYChanged`] = changedY;
			}

			this[`offsetXChanged`] = changedX;
			this[`offsetYChanged`] = changedY;
		}
		else
		{
			this.args.offsetX = 0;
			this.args.offsetY = 0;
		}

		this.fallSpeed = this.fallSpeed || 0;
	}

	onAttach(event)
	{
		const viewport   = this.args.viewport;
		const layers     = viewport.tileMap.tileLayers;
		const layerDef   = layers[ this.args.layerId ];
		const controller = viewport.actorsById[ this.meta.controller ];

		if(!layerDef)
		{
			return;
		}

		this.args.bindTo('destroyed', v => {
			const viewport = this.args.viewport;
			const layers   = viewport.tileMap.tileLayers;
			const layerDef = layers[this.args.layerId];

			layerDef.destroyed = !!v;

			if(controller)
			{
				controller.args.destroyed = !!v;
			}
		});

	}

	update(tileMap, zBuf)
	{
		const viewport = this.args.viewport;

		if(viewport.args.frameId % viewport.settings.frameSkip !== 0)
		{
			return;
		}

		if(this.args.hidden)
		{
			if(!this.hidden)
			{
				this.blocks.list.forEach(b => {
					b.style({display:'none'});
					b.remove();
				});
				this.hidden = true;
			}

			return;
		}

		if(this.args.destroyed && this.tags.background)
		{
			const tileMap  = viewport.tileMap;
			const layerId  = this.args.layerId;
			const layers   = tileMap.tileLayers;
			const layerDef = layers[layerId];

			layerDef.destroyed = true;

			this.tags.background.style({display: 'none'});

			this.args.hidden = true;

			return;
		}

		const blockSize  = this.args.blockSize;
		const blocksWide = Math.ceil((this.args.width  / blockSize)) + 1;
		const blocksHigh = Math.ceil((this.args.height / blockSize)) + 1;
		const blocksXY   = this.blocksXY;
		const centerX    = blocksWide / 2;
		const centerY    = blocksHigh / 2;
		const blocks     = this.blocks;
		const blockMetas = this.blockMeta;
		const blockSrcs  = this.blockSrcs;
		const offsetX    = this.args.offsetX;
		const offsetY    = this.args.offsetY;

		const layerId = this.args.layerId;

		let startColumn = -1;
		let endColumn   = +1 + blocksWide;

		let ii = 0;

		let willDisable = true;

		for(let i = startColumn; i < endColumn; i += Math.sign(blocksWide))
		{
			const tileX = i
				+ -Math.ceil(this.x / blockSize)
				+ -Math.ceil(offsetX / blockSize)
				+ (offsetX > 0 ? 1 : 0);

			for(let j = 0; j < blocksHigh; j += Math.sign(blocksHigh))
			{
				const tileY = j
				+ Math.floor(-this.y / blockSize)
				+ (this.offsetYChange < 0
					? -Math.ceil(offsetY / blockSize)
					: -Math.floor(offsetY / blockSize)
					)
					+ (offsetY < 0 ? -1 : 0);

				const blockId = tileMap.getTileNumber(tileX, tileY, layerId);

				const xy = `${i},${j}`;

				let block, reset;

				if(!blocksXY.has(xy) || (reset = blockMetas.get(xy).reset))
				{
					if(!reset)
					{
						block = new Tag(document.createElement('div'));

						const meta = Object.create(null, {
							visible: {value: false, writable: true}
							, reset: {value: false, writable: true}
							, src:   {value: null,  writable: true}
							, x:     {value: null,  writable: true}
							, y:     {value: null,  writable: true}
						});

						Object.preventExtensions(meta);

						blocksXY.set(xy, block);
						blockMetas.set(xy, meta);
					}
					else
					{
						const meta = blockMetas.get(xy);

						block = blocksXY.get(xy);

						meta.reset   = false;
						meta.visible = false;
						meta.src     = null;

						block.style({'background-image': `none`, display: 'none'});
					}

					const transX = blockSize * i;
					const transY = blockSize * j;
					const scale  = '1.016';

					block.style({
						transform:  `translate(${transX}px, ${transY}px) scale(${scale}, ${scale})`
						, display: 'none'
						, width:    blockSize + 'px'
						, height:   blockSize + 'px'
						, position: 'absolute'
						, left:     0
						, top:      0
					});

					blocks.add(block);
				}
				else
				{
					block = blocksXY.get(xy);
				}

				const blockMeta = blockMetas.get(xy);

				const covered = zBuf.get(xy);

				const isMoving = String(this.args.name).substr(0, 6) !== 'Moving';

				if(covered > this.args.layerId && isMoving)
				{
					if(blockMeta.visible)
					{
						block.style({display: 'none'});
					}

					blockMeta.visible = false;
					blockMeta.src = null;
					continue;
				}

				if(blockId !== false && tileMap.checkFull(blockId) && isMoving)
				{
					zBuf.set(xy, this.args.layerId);
				}

				const tileXY = [];

				if(layerId && blockId === false)
				{
					tileXY[0] = -1;
					tileXY[1] = -1;
				}
				else
				{
					Object.assign(tileXY, tileMap.getTile(blockId));
				}

				const tileset = tileXY[4];

				// const existingOffsetX = blockMeta.x;
				// const existingOffsetY = blockMeta.y;
				// const existingSrc     = blockMeta.src;

				if(tileset && tileset.meta && tileset.meta.animated)
				{
					const frames     = tileset.meta.frames;
					const oneFrame   = viewport.args.frameId;
					const speed      = tileset.meta.speed ?? 1;
					const speedFrame = Math.floor(oneFrame / speed);
					const frameIndex = speedFrame % frames;

					tileXY[1] += tileset.meta.frameSize * frameIndex;
				}

				const blockX = -1 * (tileXY[0] * blockSize);
				const blockY = -1 * (tileXY[1] * blockSize);

				const blockSrc = tileXY[2];

				if(blockId !== false && blockId !== 0)
				{
					willDisable = false;
				}

				if(blockMeta.x !== blockX || blockMeta.y !== blockY || blockMeta.src !== blockSrc)
				{
					if(blockId !== false && blockId !== 0)
					{
						const blockOffset =  blockX + 'px ' + blockY + 'px';

						block.style({
							display: 'initial'
							, 'background-position': blockOffset
							, 'background-image': `url(${blockSrc})`
							// , '--screenX': (centerX - ii) / centerX
							// , '--screenY': (j - centerY) / centerY
						});

						blockMeta.visible = true;
					}
					else if(blockMeta.visible)
					{
						block.style({display: 'none'});
						blockMeta.visible = false;
					}

					blockMeta.src = blockSrc;
					blockMeta.x   = blockX;
					blockMeta.y   = blockY;
				}
			}

			ii++;
		}

		if(this.tags.background)
		{
			const background = this.tags.background;

			if(willDisable)
			{
				background.style({display: 'none'});
			}
			else if(this.tags.background)
			{
				background.style({
					display:       'initial'
					, '--offsetX': -offsetX % blockSize
					, '--offsetY': -offsetY % blockSize
					, '--xPerspective': this.viewport.args.xPerspective
					, '--parallax': this.args.parallax
				});
			}
		}

	}
}
