import { Tag } from 'curvature/base/Tag';

export class TileMap
{
	constructor(args,parent)
	{
		this.heightMask = null;

		this.tileImages      = new Map;
		this.tileNumberCache = new Map;
		this.tileSetCache    = new Map;
		this.tileCache       = new Map;
		this.heightMasks     = new Map;
		this.heightMaskCache = new Map;
		this.solidCache = new Map;

		this.collisionLayers = [];
		this.destructibleLayers = [];

		this.tileLayers  = [];
		this.objectLayers = [];

		const mapUrl = args.mapUrl;

		this.mapUrl = mapUrl;

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

	reset()
	{
		for(let i = 0; i < this.tileLayers.length; i++)
		{
			const layer = this.tileLayers[i];

			layer.destroyed = false;

			console.log(layer);
		}
	}

	coordsToTile(x, y, layerId)
	{
		const blockSize = this.mapData.tilewidth;

		let offsetX = 0;
		let offsetY = 0;

		if(this.tileLayers[layerId])
		{
			offsetX = this.tileLayers[layerId].offsetX ?? 0;
			offsetY = this.tileLayers[layerId].offsetY ?? 0;
		}

		return [Math.floor((x-offsetX) / blockSize) , Math.floor((y-offsetY) / blockSize)];
	}

	getTileNumber(x, y, layerId = 0)
	{
		// const tileKey = x + ',' + y + ',' + layerId;
		// const cached  = this.tileNumberCache.get(tileKey);

		// if(cached !== undefined)
		// {
		// 	return cached;
		// }

		const tileLayers = this.tileLayers;
		const mapData    = this.mapData;

		if(!tileLayers[layerId])
		{
			// this.tileNumberCache.set(tileKey, false);

			return false;
		}

		if(x >= mapData.width || y >= mapData.height
			|| x < 0 || y < 0
		){
			if(layerId !== 0)
			{
				// this.tileNumberCache.set(tileKey, false);

				return false;
			}

			// this.tileNumberCache.set(tileKey, 1);

			return 1;
		}

		const tileIndex = (y * mapData.width) + x;

		if(tileIndex in tileLayers[layerId].data)
		{
			const layer = tileLayers[layerId];
			const tile  = layer.data[tileIndex];

			const tileNumber = tile > 0 ? tile - 1 : 0;

			// this.tileNumberCache.set(tileKey, tileNumber);

			return tileNumber;
		}

		// this.tileNumberCache.set(tileKey, false);

		return false;
	}

	getObjectDefs()
	{
		if(!this.mapData)
		{
			return;
		}

		return this.mapData.layers
			.filter(layer => layer.type === 'objectgroup')
			.map(layer => layer.objects)
			.flat();
	}

	getTile(tileNumber)
	{
		const cached = this.tileCache.get(tileNumber);

		if(cached !== undefined)
		{
			return cached;
		}

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

		const result = [x,y,src];

		this.tileCache.set(tileNumber, result);

		return result;
	}

	getSolid(xInput, yInput, layerInput = 0)
	{
		const currentTile = this.coordsToTile(xInput, yInput, layerInput);
		const tileNumber  = this.getTileNumber(...currentTile, layerInput);

		if(layerInput === 1 || layerInput ===  2)
		{
			if(this.getSolid(xInput, yInput, 0))
			{
				return this.tileLayers[0];
			}

			for(let i = 3; i < this.tileLayers.length; i++)
			{
				const layer = this.tileLayers[i];

				if(layer.name.substring(0, 3) === 'Art')
				{
					continue;
				}

				if(layer.name.substring(0, 10) === 'Foreground')
				{
					continue;
				}

				if(layer.name.substring(0, 12) === 'Destructible')
				{
					if(layer.destroyed)
					{
						continue;
					}
				}

				if(this.getSolid(xInput, yInput, i))
				{
					return this.tileLayers[i];
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
				return this.tileLayers[layerInput];
			}
		}

		const tileSet = this.getTileset(tileNumber);

		const mapData   = this.mapData;
		const blockSize = mapData.tilewidth;

		const tilePos = this.getTile(tileNumber).map(coord => coord * blockSize);

		const x = (Number(xInput) % blockSize);
		const y = (Number(yInput) % blockSize);

		const xPixel = tilePos[0] + x;
		const yPixel = tilePos[1] + y;

		const heightMaskKey   = [xPixel, yPixel, tileNumber].join('::');
		const heightMaskCache = this.heightMaskCache;

		if(heightMaskCache.has(heightMaskKey))
		{
			return heightMaskCache.get(heightMaskKey);
		}

		const heightMask = this.heightMasks.get(tileSet);

		const pixel = heightMask.getContext('2d').getImageData(xPixel, yPixel, 1, 1).data;

		let result = false;

		// if(pixel[0] === 255 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 255)
		// {
		// 	// result = 0xFF0000;
		// 	result = true;
		// }
		// else
		if(pixel[3] === 255)
		{
			// result = 0xFFFFFF;
			result = this.tileLayers[layerInput];
		}
		else
		{
			result = false;
		}

		heightMaskCache.set(heightMaskKey, result);

		return result;
	}

	getTileset(tileNumber)
	{
		tileNumber = Number(tileNumber);

		const cached = this.tileSetCache.get(tileNumber);

		if(cached !== undefined)
		{
			return cached;
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
