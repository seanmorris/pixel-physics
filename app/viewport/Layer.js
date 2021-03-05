import { View } from 'curvature/base/View';
import { Tag } from 'curvature/base/Tag';
import { Bag  } from 'curvature/base/Bag';

export class Layer extends View
{
	template  = require('./layer.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.width  = 320;
		this.args.height = 200;

		this.args.blockSize = 32;

		this.x = 0;
		this.y = 0;

		this.args.offsetX = 0;
		this.args.offsetY = 0;

		this.args.layerId = 0 || this.args.layerId;

		Object.defineProperty(this, 'blocksXY', {value: {}});
		Object.defineProperty(this, 'blocks', {value: new Bag});
		Object.defineProperty(this, 'offsets', {value: new Map});

		this.args.blocks = this.blocks.list;
	}

	update(tileMap, xDir, yDir)
	{
		if(this.args.destroyed && this.tags.background)
		{
			const viewport = this.args.viewport;
			const tileMap  = viewport.tileMap;
			const layerId  = this.args.layerId;
			const layers   = tileMap.tileLayers;
			const layerDef = layers[layerId];

			layerDef.destroyed = true;

			this.tags.background.style({display: 'none'});

			return;
		}

		const blockSize  = this.args.blockSize;
		const blocksWide = Math.ceil((this.args.width  / blockSize));
		const blocksHigh = Math.ceil((this.args.height / blockSize));
		const blocksXY   = this.blocksXY;
		const blocks     = this.blocks;
		const offsets    = this.offsets;
		const offsetX    = this.args.offsetX;
		const offsetY    = this.args.offsetY;

		const layerId = this.args.layerId;

		let startColumn = 0;
		let endColumn   = blocksWide;

		for(let i = startColumn; i <= endColumn; i += Math.sign(blocksWide))
		{
			const tileX = i - Math.ceil(this.x / blockSize);

			for(let j = 0; j <= blocksHigh; j += Math.sign(blocksHigh))
			{
				const xy = [i,j].join('::');

				let block;

				if(!blocksXY[xy])
				{
					blocksXY[xy] = new Tag('<div>');

					block = blocksXY[xy];

					block.style({width: blockSize + 'px', height: blockSize + 'px'});

					const transX = blockSize * i;
					const transY = blockSize * j;

					block.style({
						transform: `translate(${transX}px, ${transY}px)`
						, 'background-image': 'url(/map/shapes.png)'
						, position: 'absolute'
						, left: 0
						, top: 0
					});

					blocks.add(block);
				}
				else
				{
					block = blocksXY[xy];
				}

				const tileY = j - Math.ceil(this.y / blockSize);

				const blockId = tileMap.getTileNumber(tileX, tileY, layerId);

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

				const blockOffset = -1 * (tileXY[0] * blockSize)
					+ 'px '
					+ -1 * (tileXY[1] * blockSize)
					+ 'px';

				if(existingOffset !== blockOffset)
				{
					if(blockId !== false && blockId !== 0)
					{
						block.style({display: 'initial', 'background-position': blockOffset});
					}
					else
					{
						block.style({display: 'none'});
					}
				}

				offsets.set(block, blockOffset);
			}
		}
	}
}
