import { Tag } from 'curvature/base/Tag';
import { Mixin } from 'curvature/base/Mixin';
import { Bindable } from 'curvature/base/Bindable';
import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';

import { Elicit } from './Elicit';

export class TileMap extends Mixin.with(EventTargetMixin)
{
	constructor(args, parent)
	{
		super();

		this.meta = new Map;

		this.heightMask      = null;
		this.tileImages      = new Map;
		this.tileNumberCache = new Map;
		this.tileSetCache    = new Map;
		this.tileCache       = new Map;
		this.heightMasks     = new Map;
		this.heightMaskCache = new Map;

		this.tileLayers  = [];

		this.destructibleLayers = [];
		this.collisionLayers = [];
		this.objectLayers = [];

		const url = args.mapUrl;

		this.mapData = null;
		this.mapUrl  = url;

		this.maps = new Map;

		this.replacements = new Map;

		const elicit = new Elicit(url);

		elicit.addEventListener('progress', event => {
			const {received, length, done} = event.detail;

			const type = 'map';

			this.dispatchEvent(new CustomEvent(
				'level-progress', { detail: {length, received, done, url}}
			));
		});

		this.ready = elicit.stream()
		.then(response => response.json())
		.then(tilemapData => {

			this.mapData = tilemapData;

			if(tilemapData && tilemapData.properties)
			{
				for(const property of tilemapData.properties)
				{
					const name = property.name.replace(/-/g, '_');

					this.meta.set(name, property.value);
				}
			}

			this.desparseLayers(tilemapData)

			this.loadLayers(tilemapData)

			return this.loadTilesets(tilemapData.tilesets);
		});

		Object.preventExtensions(this);
	}

	desparseLayers(tilemapData)
	{
		console.time('desparse');

		for(const layer of tilemapData.layers)
		{
			if(layer.type !== 'tilelayer' || !layer.sparsed || layer.data)
			{
				continue;
			}

			const desparsed = layer.data = {};

			while(layer.sparsed.length)
			{
				const tileNo = Number(layer.sparsed.pop());
				const tileId = Number(layer.sparsed.pop());

				desparsed[tileId] = tileNo;
			}
		}

		console.timeEnd('desparse');
	}

	loadTilesets(tilesetUrls)
	{
		const setHeightMasks = [];
		const imageProgress  = new Map;
		const imageSize      = new Map;

		for(const i in tilesetUrls)
		{
			const tileset = this.mapData.tilesets[i];

			const image = new Image;

			this.tileImages.set(tileset, image);

			const imageUrl = '/map/' + tileset.image;

			tileset.original = tileset.image = imageUrl;

			const fetchImage = new Elicit(imageUrl);

			fetchImage.addEventListener('progress', event => {
				const {received, length, done} = event.detail;

				imageProgress.set(fetchImage, received);
				imageSize.set(fetchImage, length);

				const imagesProgress = [...imageProgress.values()]
				.reduce((a, b) => Number(a)+Number(b));

				const imagesLength = [...imageSize.values()]
				.reduce((a, b) => Number(a)+Number(b));

				const imagesDone = imagesProgress / imagesLength;

				this.dispatchEvent(new CustomEvent(
					'texture-progress', { detail: {
						length:imagesLength
						, received:imagesProgress
						, done:imagesDone
						, url:imageUrl
					}}
				));
			});

			const heightMask = fetchImage.objectUrl().then(url => new Promise(accept => {

				tileset.cachedImage = url;

				image.addEventListener('load', event => {

					this.replacements.set(imageUrl, url);

					const heightMask = new Tag('<canvas>');

					heightMask.width  = image.width;
					heightMask.height = image.height;

					heightMask.getContext('2d').drawImage(
						image, 0, 0, image.width, image.height
					);

					this.heightMasks.set(tileset, heightMask);

					accept(heightMask);

				}, {once:true});

				image.src = url;
			}));

			setHeightMasks.push(heightMask);
		}

		return Promise.all(setHeightMasks);
	}

	loadLayers(tilemapData)
	{
		const layerGroup = {};

		const layers = tilemapData.layers || [];

		tilemapData.layers.forEach(layer => {
			layer.offsetX        = false;
			layer.offsetY        = false;
			layer.offsetXChanged = false;
			layer.offsetYChanged = false;
			layer.destroyed      = false;
			layer.layer          = null;
			Object.preventExtensions(layer);
		});

		this.objectLayers = tilemapData.layers.filter(l => l.type === 'objectLayers');
		this.tileLayers   = tilemapData.layers.filter(l => l.type === 'tilelayer');

		// layerGroup.objectLayers = this.objectLayers;
		layerGroup.tileLayers   = this.tileLayers;

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

		layerGroup.destructibleLayers = this.destructibleLayers;
		layerGroup.collisionLayers    = this.collisionLayers;
	}

	addMap(url, xOffset = 0, yOffset = 0)
	{
		const elicit = new Elicit(url);

		elicit.stream()
		.then(response => response.json())
		.then(data => {
			console.log(data);
		});

		elicit.addEventListener('progress', event => {
			const {received, length, done} = event.detail;


			// const type = 'map';

			// this.dispatchEvent(new CustomEvent(
			// 	'level-progress', {detail: {length, received, done, url}}
			// ));
		});
	}

	reset()
	{
		for(let i = 0; i < this.tileLayers.length; i++)
		{
			const layer = this.tileLayers[i];

			layer.destroyed = false;
		}
	}

	coordsToTile(x, y, layerId)
	{
		const blockSize = this.blockSize;

		let offsetX = 0;
		let offsetY = 0;

		if(this.tileLayers[layerId])
		{
			offsetX = this.tileLayers[layerId].offsetX ?? 0;
			offsetY = this.tileLayers[layerId].offsetY ?? 0;
		}

		return [
			Math.floor( (x-offsetX) / blockSize )
			, Math.floor( (y-offsetY) / blockSize )
		];
	}

	getTileNumber(x, y, layerId = 0)
	{
		const tileKey = x + ',' + y + ',' + layerId;
		const cached  = this.tileNumberCache.get(tileKey);

		if(cached !== undefined)
		{
			return cached;
		}

		const tileLayers = this.tileLayers;
		const mapData    = this.mapData;

		if(!tileLayers[layerId])
		{
			this.tileNumberCache.set(tileKey, false);

			return false;
		}

		if(x >= mapData.width || x < 0)
		{
			if(x < 0 || !this.meta.get('wrapX'))
			{
				if(layerId !== 0)
				{
					this.tileNumberCache.set(tileKey, false);

					return false;
				}

				this.tileNumberCache.set(tileKey, 1);

				return 1;
			}
			else
			{
				if(x < 0 && x % this.mapData.width !== 0)
				{
					y++;
				}

				x = x % this.mapData.width;
			}
		}

		if(y >= mapData.height || y < 0)
		{
			if(y < 0 || !this.meta.get('wrapY'))
			{
				if(layerId !== 0)
				{
					this.tileNumberCache.set(tileKey, false);

					return false;
				}

				this.tileNumberCache.set(tileKey, 1);

				return 1;
			}
			else
			{
				y = y % this.mapData.height;
			}
		}

		const tileIndex = (y * mapData.width) + x;

		if(tileIndex in tileLayers[layerId].data)
		{
			const layer = tileLayers[layerId];
			const tile  = layer.data[tileIndex];

			const tileNumber = tile > 0 ? tile - 1 : 0;

			this.tileNumberCache.set(tileKey, tileNumber);

			return tileNumber;
		}

		this.tileNumberCache.set(tileKey, false);

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
			if(this.replacements.has(cached[3]))
			{
				cached[2] = this.replacements.get(cached[3]);
			}

			return cached;
		}

		const blockSize = this.blockSize;

		let x   = 0;
		let y   = 0;
		let src = '';
		let original = '';

		const tileset = this.getTileset(tileNumber);
		const image   = this.tileImages.get(tileset);

		if(tileNumber)
		{
			const localTileNumber = tileNumber + -tileset.firstgid + 1;

			const blocksWide = Math.ceil(image.width / blockSize);

			x = localTileNumber % blocksWide;
			y = Math.floor(localTileNumber/blocksWide);
			src = tileset.image;
			original = tileset.original;
		}

		const result = [x,y,src,original];

		this.tileCache.set(tileNumber, result);

		return result;
	}

	getSolid(xInput, yInput, layerInput = 0)
	{
		xInput = Math.trunc(xInput);
		yInput = Math.trunc(yInput);

		const currentTile = this.coordsToTile(xInput, yInput, layerInput);
		const tileNumber  = this.getTileNumber(...currentTile, layerInput);

		const solidLayerCount = this.collisionLayers.length;

		if(layerInput > 0  && layerInput < solidLayerCount)
		{
			if(this.getSolid(xInput, yInput, 0))
			{
				return this.tileLayers[0];
			}

			for(let i = 0 + solidLayerCount; i < this.tileLayers.length; i++)
			{
				const layer = this.tileLayers[i];

				if(layer.name.substring(0, 3) === 'Art')
				{
					continue;
				}

				if(layer.name.substring(0, 10) === 'Moving Art')
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

		if(1||layerInput <= 3)
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

		const tileSet   = this.getTileset(tileNumber);
		const mapData   = this.mapData;
		const blockSize = mapData.tilewidth;

		const tileCoords = this.getTile(tileNumber);
		const tilePos = [tileCoords[0] * blockSize, tileCoords[1] * blockSize];

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
			if(this.replacements.has(cached.original))
			{
				cached.image = this.replacements.get(cached.original);
			}

			return cached;
		}

		if(!this.mapData)
		{
			return;
		}

		for(const i in this.mapData.tilesets)
		{
			const tileset = this.mapData.tilesets[i];

			if(tileNumber + 1 >= tileset.firstgid)
			{
				const nextTileset = this.mapData.tilesets[Number(i) + 1];

				if(nextTileset)
				{
					if(tileNumber + 1 < nextTileset.firstgid)
					{
						this.tileSetCache.set(tileNumber, tileset);

						if(this.replacements.has(tileset.original))
						{
							tileset.image = this.replacements.get(tileset.original);
						}

						return tileset;
					}
				}
				else
				{
					this.tileSetCache.set(tileNumber, tileset);

					if(this.replacements.has(tileset.original))
					{
						tileset.image = this.replacements.get(tileset.original);
					}

					return tileset;
				}

			}
		}
	}

	reset()
	{
		this.replacements.clear();
		this.tileSetCache.clear();
		this.tileCache.clear();

		for(const tileset of this.mapData.tilesets)
		{
			tileset.image = tileset.original;
		}
	}

	get blockSize()
	{
		return this.mapData.tilewidth;
	}
}
