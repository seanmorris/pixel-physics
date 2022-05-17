import { Bindable } from 'curvature/base/Bindable';
import { View } from 'curvature/base/View';
import { Tag } from 'curvature/base/Tag';
import { Bag  } from 'curvature/base/Bag';

export class Layer extends View
{
	template  = require('./layer.html');

	constructor(args,parent)
	{
		args[ Bindable.NoGetters ] = true;

		super(args,parent);

		this[ Bindable.NoGetters ] = true;

		this.args.width  = args.width  || 320;
		this.args.height = args.height || 200;

		this.args.blockSize = args.blockSize || 32;

		this.x = 0;
		this.y = 0;

		this.hidden = false;

		this.args.offsetX = 0;
		this.args.offsetY = 0;

		this.args.layerId = 0 || this.args.layerId;

		Object.defineProperty(this, 'blocksXY',  {value: new Map});
		Object.defineProperty(this, 'blocks',    {value: new Bag});
		Object.defineProperty(this, 'offsets',   {value: new Map});
		Object.defineProperty(this, 'blockSrcs', {value: new Map});

		this.args.blocks = this.blocks.list;

		this.meta = {};

		const viewport = this.args.viewport;
		const layers   = viewport.tileMap.tileLayers;
		const layerDef = layers[this.args.layerId];

		if(layerDef.properties)
		{
			for(const property of layerDef.properties)
			{
				this.meta[property.name] = property.value;

			}

			layerDef.layer = this;
		}

		this.offsetXChanged = 0;
		this.offsetYChanged = 0;

		this.fallSpeed      = 0;

		Object.preventExtensions(this);
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

	update(tileMap)
	{
		const viewport = this.args.viewport;

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
		const blocksWide = Math.ceil((this.args.width  / blockSize)) + 2;
		const blocksHigh = Math.ceil((this.args.height / blockSize)) + 1;
		const blocksXY   = this.blocksXY;
		const centerX    = blocksWide / 2;
		const centerY    = blocksHigh / 2;
		const blocks     = this.blocks;
		const offsets    = this.offsets;
		const blockSrcs  = this.blockSrcs;
		const offsetX    = this.args.offsetX;
		const offsetY    = this.args.offsetY;

		const layerId = this.args.layerId;

		let startColumn = -1;
		let endColumn   = blocksWide;

		let ii = 0;

		for(let i = startColumn; i <= endColumn; i += Math.sign(blocksWide))
		{
			const tileX = i
				+ -Math.ceil(this.x / blockSize)
				+ -Math.ceil(offsetX / blockSize)
				+ (offsetX > 0 ? 1 : 0);

			for(let j = 0; j <= blocksHigh; j += Math.sign(blocksHigh))
			{
				const xy = String(i) + '::' + String(j);

				// const tileY = j - Math.ceil(this.y / blockSize);

				const tileY = j
					+ Math.floor(-this.y / blockSize)
					+ (this.offsetYChange < 0
						? -Math.ceil(offsetY / blockSize)
						: -Math.floor(offsetY / blockSize)
					)
					+ (offsetY < 0 ? -1 : 0);

				const blockId = tileMap.getTileNumber(tileX, tileY, layerId);

				let block;

				if(!blocksXY.has(xy))
				{
					block = new Tag(document.createElement('div'));

					blocksXY.set(xy, block);

					block.style({width: blockSize + 'px', height: blockSize + 'px'});

					const transX = blockSize * i;
					const transY = blockSize * j;
					const scale  = '1.02';

					block.style({
						transform: `translate(${transX}px, ${transY}px) scale(${scale}, ${scale})`
						, position: 'absolute'
						, left: 0
						, top: 0
					});

					blocks.add(block);
				}
				else
				{
					block = blocksXY.get(xy);
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

				const existingOffset = offsets.get(block);
				const existingSrc    = blockSrcs.get(block);

				const blockOffset = -1 * (tileXY[0] * blockSize)
					+ 'px '
					+ -1 * (tileXY[1] * blockSize)
					+ 'px';

				const blockSrc = tileXY[2];

				if(existingOffset !== blockOffset || existingSrc !== blockSrc)
				{
					if(blockId !== false && blockId !== 0)
					{
						block.style({
							display: 'initial'
							, 'background-position': blockOffset
							, 'background-image': `url(${blockSrc})`
							, '--screenX': (centerX - ii) / centerX
							, '--screenY': (j - centerY) / centerY
						});
					}
					else
					{
						block.style({display: 'none'});
					}
				}

				offsets.set(block, blockOffset);
				blockSrcs.set(block, blockSrc);
			}

			ii++;
		}

		if(this.tags.background)
		{
			const background = this.tags.background;

			background.style({
				'--offsetX': -offsetX % blockSize
				, '--offsetY': -offsetY % blockSize
			});
		}
	}
}
