import { PointActor } from './PointActor';

export class LayerController extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.activated = false;

		this.args.xLayer = 0;
		this.args.yLayer = 0;

		this.args.xLayerSpeed = 0;
		this.args.yLayerSpeed = 0;

		this.args.yLayerSpeedMax = this.args.yLayerSpeedMax || 9;

		this.args.fall = this.args.fall ?? true;

		this.args.xLayerLimit = this.args.xLayerLimit || null;
		this.args.yLayerLimit = this.args.yLayerLimit || null;

		this.args.yQuake = this.args.yQuake ?? 5;

		this.args.static = true;

		this.args.hidden = true;
	}

	update()
	{
		if(!this.viewport)
		{
			return;
		}

		if(this.args.activated && this.args.fall)
		{
			this.args.yLayerSpeed += 0.25;
		}

		if(this.args.activated && this.args.swim)
		{
			this.args.xLayerSpeed += 1;
		}

		if(this.args.yLayerSpeed > this.args.yLayerSpeedMax && this.args.yLayerSpeedMax > 0)
		{
			this.args.yLayerSpeed = this.args.yLayerSpeedMax;
		}

		if(this.args.xLayerSpeed > this.args.xLayerSpeedMax && this.args.xLayerSpeedMax > 0)
		{
			this.args.xLayerSpeed = this.args.xLayerSpeedMax;
		}

		if(this.args.yLayerSpeed)
		{
			this.args.yLayer = Math.round(this.args.yLayer + this.args.yLayerSpeed || 0);
		}

		if(this.args.xLayerSpeed)
		{
			this.args.xLayer = Math.round(this.args.xLayer + this.args.xLayerSpeed || 0);
		}

		const tileSize  = this.viewport.tileMap.mapData.tileheight;

		const xMapTiles = this.viewport.tileMap.mapData.width;
		const yMapTiles = this.viewport.tileMap.mapData.height;

		const mapWidth = this.viewport.tileMap.meta.wrapX
			? Infinity
			: xMapTiles * tileSize;

		const mapHeight = this.viewport.tileMap.meta.wrapY
			? Infinity
			: yMapTiles * tileSize;

		if(this.args.yLayerLimit > 0
			&& this.args.yLayer > mapHeight
			&& this.args.yLayer > this.args.yLayerLimit
		){
			this.args.yLayerSpeed = 0;

			this.args.yLayer = this.args.yLayerLimit;

			const target = this.viewport.actorsById[ this.args.target ];

			this.viewport.auras.delete(target);
			this.viewport.auras.delete(this);
		}

		if(this.args.xLayerLimit > 0
			&& (this.args.xLayer > mapWidth || this.args.xLayer > this.args.xLayerLimit)
		){
			this.args.xLayerSpeed = 0;

			this.args.xLayer = this.args.xLayerLimit;

			const target = this.viewport.actorsById[ this.args.target ];

			this.viewport.auras.delete(target);
			this.viewport.auras.delete(this);
		}
	}

	activate(other, button)
	{
		if(this.args.activated)
		{
			return;
		}

		this.viewport.auras.add(this);

		this.viewport.args.shakeY = this.args.yQuake;

		this.viewport.onFrameOut(60, () => {
			this.args.activated = true;
		});

		this.args.yLayerLimit = this.args.yLayerLimit ?? 4096;

		if(this.args.target && this.viewport.actorsById[ this.args.target ])
		{
			const target = this.viewport.actorsById[ this.args.target ];

			this.viewport.auras.add(target);

			target.activate(other, this);
		}
	}
}
