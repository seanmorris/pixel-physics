import { Tag } from 'curvature/base/Tag';

export class TileMap
{
	constructor(args,parent)
	{
		this.heightMask = null;

		this.tileImages      = new Map;
		this.tileNumberCache = new Map;
		this.tileSetCache    = new Map;
		this.heightMasks     = new Map;
		this.heightMaskCache = new Map;
		this.solidCache = new Map;

		this.collisionLayers = [];
		this.destructibleLayers = [];

		this.tileLayers  = [];
		this.objectLayers = [];

		const mapUrl = '/map/pixel-hill-zone.json';

		this.ready = new Promise(accept => {

			fetch(mapUrl).then(r=> r.json()).then(data => {
				Object.defineProperty(this, 'mapData', {value: data});

				const layers = data.layers || [];

				this.objectLayers = layers.filter(l => l.type === 'objectLayers');
				this.tileLayers   = layers.filter(l => l.type === 'tilelayer');

				this.collisionLayers = this.tileLayers.filter(l => {

					if(!l.name.match(/^Collision\s\d+/))
					{
						return false;
					}

					return true;
				})

				this.destructibleLayers = this.tileLayers.filter(l => {

					if(!l.name.match(/^Destructible\s\d+/))
					{
						return false;
					}

					return true;
				});

				const fetchImages = [];

				for(const i in this.mapData.tilesets)
				{
					const tileset = this.mapData.tilesets[i];

					const image = new Image;
					// console.log(image);

					this.tileImages.set(tileset, image);

					const fetchImage = new Promise(accept => {

						image.addEventListener('load', event => {

							const heightMask = new Tag('<canvas>');

							heightMask.width  = image.width;
							heightMask.height = image.height;

							heightMask.getContext('2d').drawImage(
								image, 0, 0, image.width, image.height
							);

							this.heightMasks.set(tileset, heightMask);

							accept(image.heightMask);
						});

					});

					image.src = '/map/' + tileset.image;

					fetchImages.push(fetchImage);
				}

				Promise.all(fetchImages).then(accept);
			});
		});
	}

	coordsToTile(x, y)
	{
		const blockSize = this.mapData.tilewidth;

		return [Math.floor(x / blockSize) , Math.floor((y) / blockSize)];
	}

	getTileNumber(x, y, layerId = 0)
	{
		// const cacheKey = [x, y, layerId].join('::');

		// const tileNumberCache = this.tileNumberCache;
		const tileLayers      = this.tileLayers;
		const mapData         = this.mapData;

		// if(tileNumberCache.has(cacheKey))
		// {
		// 	return tileNumberCache.get(cacheKey);
		// }

		// if(!tileLayers[layerId])
		// {
		// 	return tileNumberCache.set(cacheKey, false);
		// }

		if(x >= mapData.width || y >= mapData.height
			|| x < 0 || y < 0
		){
			if(layerId !== 0)
			{
				// tileNumberCache.set(cacheKey, false);

				return false;
			}

			// tileNumberCache.set(cacheKey, 1);

			return 1;
		}

		const tileIndex = (y * mapData.width) + x;

		if(tileIndex in tileLayers[layerId].data)
		{
			// tileNumberCache.set(cacheKey, tileLayers[layerId].data[tileIndex] - 1);

			const layer = tileLayers[layerId];
			const tile  = layer.data[tileIndex];

			return tile > 0 ? tile - 1 : 0;
		}

		// tileNumberCache.set(cacheKey, false);

		return false;
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

		let x   = 0;
		let y   = 0;
		let src = '';

		const tileset = this.getTileset(tileNumber);
		const image   = this.tileImages.get(tileset);

		if(tileNumber)
		{
			const localTileNumber = tileNumber + -tileset.firstgid + 1;

			const blocksWide = Math.ceil(image.width / blockSize);

			x = localTileNumber % blocksWide;
			y = Math.floor(localTileNumber/blocksWide);
			src = tileset.image;
		}

		return [x,y,src];
	}

	getSolid(xInput, yInput, layerInput = 0)
	{
		const currentTile = this.coordsToTile(xInput, yInput);
		const tileNumber  = this.getTileNumber(...currentTile, layerInput);

		const tileSet = this.getTileset(tileNumber);

		const heightMask      = this.heightMasks.get(tileSet);
		const heightMaskCache = this.heightMaskCache;

		const mapData         = this.mapData;

		const blockSize = mapData.tilewidth;

		if(layerInput === 1 || layerInput ===  2)
		{
			if(this.getSolid(xInput, yInput, 0))
			{
				return true;
			}

			for(let i = 3; i < this.tileLayers.length; i++)
			{
				const layer = this.tileLayers[i];

				if(layer.name.substring(0, 12) === 'Destructible')
				{
					if(layer.destroyed)
					{
						continue;
					}
				}

				if(this.getSolid(xInput, yInput, i))
				{
					return true;
				}
			}
		}

		if(layerInput <= 2)
		{
			if(tileNumber === 0)
			{
				return false;
			}

			if(tileNumber === 1)
			{
				return true;
			}
		}

		const tilePos = this.getTile(tileNumber).map(coord => {
			return coord * blockSize
		});

		const x = Math.floor(Number(xInput) % blockSize);
		const y = Math.floor(Number(yInput) % blockSize);

		const xPixel = tilePos[0] + x;
		const yPixel = tilePos[1] + y;

		const heightMaskKey = [xPixel, yPixel, tileNumber].join('::');

		if(heightMaskCache.has(heightMaskKey))
		{
			return heightMaskCache.get(heightMaskKey);
		}


		heightMaskCache.set(heightMaskKey, false);

		const pixel = heightMask.getContext('2d').getImageData(
			xPixel, yPixel, 1, 1
		).data;

		// if(pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 255)
		if(pixel[3] === 255)
		{
			heightMaskCache.set(heightMaskKey, true);
		}

		return heightMaskCache.get(heightMaskKey);
	}

	getTileset(tileNumber)
	{
		tileNumber = Number(tileNumber);

		if(this.tileSetCache.has(tileNumber))
		{
			return this.tileSetCache.get(tileNumber);
		}

		if(!this.mapData)
		{
			return;
		}

		for(const i in this.mapData.tilesets)
		{
			const tileset = this.mapData.tilesets[i];

			// console.log(tileNumber, tileset.firstgid);

			if(tileNumber + 1 >= tileset.firstgid)
			{
				const nextTileset = this.mapData.tilesets[Number(i) + 1];

				let src;

				if(nextTileset)
				{
					if(tileNumber + 1 < nextTileset.firstgid)
					{
						this.tileSetCache.set(tileNumber, tileset);

						return tileset;
					}
				}
				else
				{
					this.tileSetCache.set(tileNumber, tileset);

					return tileset;
				}

			}
		}
	}

	get blockSize()
	{
		return this.mapData.tilewidth;
	}
}
