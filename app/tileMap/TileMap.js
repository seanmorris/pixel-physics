import { Tag } from 'curvature/base/Tag';

export class TileMap
{
	constructor(args,parent)
	{
		this.heightMask = null;

		this.tileNumberCache = {};
		this.heightMaskCache = {};
		this.solidCache = {};

		this.tileLayers  = [];
		this.objectLayers = [];

		const mapUrl = '/map/pixel-hill-zone.json';

		this.ready = new Promise(accept => {

			fetch(mapUrl).then(r=> r.json()).then(data => {

				this.mapData = data;

				const layers = data.layers || [];

				this.objectLayers = layers.filter(l => l.type === 'objectLayers');
				this.tileLayers   = layers.filter(l => l.type === 'tilelayer');

				const image = new Image();

				image.src = '/Sonic/testTiles2.png';

				image.addEventListener('load', event => {
					this.width  = image.width;
					this.height = image.height;

					const heightMask = new Tag('<canvas>');

					heightMask.width  = image.width;
					heightMask.height = image.height;

					heightMask.getContext('2d').drawImage(
						image, 0, 0, this.width, this.height
					);

					this.heightMask = heightMask;

					accept();
				});

			});
		});
	}

	coordsToTile(x, y)
	{
		const blockSize = this.mapData.tilewidth;

		return [Math.floor(x / blockSize) , Math.floor((y) / blockSize)];
	}

	getTileNumber(x, y, layer = 0)
	{
		const cacheKey = [x, y, layer].join('::');

		const tileNumberCache = this.tileNumberCache;
		const tileLayers      = this.tileLayers;
		const mapData         = this.mapData;

		if(cacheKey in tileNumberCache)
		{
			return tileNumberCache[cacheKey];
		}

		if(!tileLayers[layer])
		{
			return tileNumberCache[cacheKey] = false;
		}

		if(x >= mapData.width || y >= mapData.height
			|| x < 0 || y < 0
		){
			if(layer !== 0)
			{
				return tileNumberCache[cacheKey] = false;
			}
			return tileNumberCache[cacheKey] = 1;
		}

		const tileIndex = (y * mapData.width) + x;

		if(tileIndex in tileLayers[layer].data)
		{
			if(tileLayers[layer].data[tileIndex] !== 0)
			{
				return tileNumberCache[cacheKey] = tileLayers[layer].data[tileIndex] -1;
			}
		}

		return tileNumberCache[cacheKey] = false;
	}

	getObjectDefs()
	{
		return this.mapData.layers
			.filter(layer => layer.type === 'objectgroup')
			.map(layer => layer.objects)
			.flat();
	}

	getTile(tileNumber)
	{
		const blockSize = this.blockSize;

		let x = 0;
		let y = 0;

		if(tileNumber)
		{
			const blocksWide = Math.ceil(this.width / blockSize);

			x = tileNumber % blocksWide;
			y = Math.floor(tileNumber/blocksWide);
		}

		return [x,y];
	}

	getSolid(xInput, yInput, layerInput = 0)
	{
		const heightMaskCache = this.heightMaskCache;
		const heightMask      = this.heightMask;

		const solidCacheKey   = [xInput, yInput, layerInput].join('::');
		const solidCache      = this.solidCache;
		const mapData         = this.mapData;

		if(solidCacheKey in solidCache)
		{
			return solidCache[solidCacheKey];
		}

		const blockSize = mapData.tilewidth;

		if(layerInput !== 0)
		{
			if(this.getSolid(xInput, yInput, 0))
			{
				return solidCache[solidCacheKey] = true;
			}
		}

		const currentTile = this.coordsToTile(xInput, yInput);
		const tileNumber  = this.getTileNumber(...currentTile, layerInput);

		if(tileNumber === 0)
		{
			solidCache[solidCacheKey] = false;
		}

		if(tileNumber === 1)
		{
			solidCache[solidCacheKey] = true;
		}

		const tilePos = this.getTile(tileNumber).map(coord => {
			return coord * blockSize
		});

		const x = Math.floor(Number(xInput) % blockSize);
		const y = Math.floor(Number(yInput) % blockSize);

		const heightMaskKey = [xInput, yInput, tileNumber].join('::');

		if(heightMaskKey in heightMaskCache)
		{
			return solidCache[solidCacheKey] = heightMaskCache[heightMaskKey];
		}

		const xPixel = tilePos[0] + x;
		const yPixel = tilePos[1] + y;

		heightMaskCache[heightMaskKey] = false;

		const pixel = heightMask.getContext('2d').getImageData(
			xPixel, yPixel, 1, 1
		).data;

		if(pixel[0] === 0)
		{
			heightMaskCache[heightMaskKey] = true;
		}

		return solidCache[solidCacheKey] = heightMaskCache[heightMaskKey];
	}

	get blockSize()
	{
		return this.mapData.tilewidth;
	}
}
