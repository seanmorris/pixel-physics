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

		this.args.blockSize = 32;

		this.x = 0;
		this.y = 0;

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
	}

	move()
	{
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
			this.args.offsetX = controller.args.xLayer || 0;
			this.args.offsetY = controller.args.yLayer || 0;
		}
		else
		{
			this.args.offsetX = 0;
			this.args.offsetY = 0;
		}


		this.fallspeed = this.fallspeed || 0;
	}

	onAttach(event)
	{
		const viewport   = this.args.viewport;
		const layers     = viewport.tileMap.tileLayers;
		const layerDef   = layers[ this.args.layerId ];
		const controller = viewport.actorsById[ this.meta.controller ];

		if(!layerDef || !controller)
		{
			return;
		}

		console.log(layers[ this.args.layerId ], controller);

		this.args.bindTo('destroyed', v => {
			const viewport = this.args.viewport;
			const layers   = viewport.tileMap.tileLayers;
			const layerDef = layers[this.args.layerId];

			layerDef.destroyed = !!v;

			controller.args.destroyed = !!v;
		});

		// controller.args.bindTo('xLayer', v => { this.args.offsetX = v || 0});
		// controller.args.bindTo('yLayer', v => { this.args.offsetY = v || 0});

		this.args.bindTo(['offsetX', 'offsetY'], (v,k,t,d,p) => {

			const changed = v - (p||0);

			layerDef[k] = v;
			controller.args[k] = v;

			controller.args[`${k}Changed`] = changed;
			layerDef[`${k}Changed`] = changed;
			this[`${k}Changed`] = changed
		});

	}

	update(tileMap)
	{
		const viewport = this.args.viewport;

		if(this.args.destroyed && this.tags.background)
		{
			const tileMap  = viewport.tileMap;
			const layerId  = this.args.layerId;
			const layers   = tileMap.tileLayers;
			const layerDef = layers[layerId];

			layerDef.destroyed = true;

			this.tags.background.style({display: 'none'});

			return;
		}

		const blockSize  = this.args.blockSize;
		const blocksWide = Math.ceil((this.args.width  / blockSize)) + 1;
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

		let startColumn = 0;
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
					block = new Tag('<div>');

					blocksXY.set(xy, block);

					block.style({width: blockSize + 'px', height: blockSize + 'px'});

					const transX = blockSize * i;
					const transY = blockSize * j;

					block.style({
						transform: `translate(${transX}px, ${transY}px) scale(1.01, 1.01)`
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

				let tileXY = [];

				if(layerId && blockId === false)
				{
					tileXY[0] = -1;
					tileXY[1] = -1;
				}
				else
				{
					tileXY = tileMap.getTile(blockId);
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
							display: 'initial', 'background-position': blockOffset
							, 'background-image': `url(/map/${blockSrc})`
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

			background.style({'--offsetX': -offsetX % blockSize});
			background.style({'--offsetY': -offsetY % blockSize});
		}

	}
}
