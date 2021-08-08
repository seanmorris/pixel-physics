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

		this.args.xLayerLimit = this.args.xLayerLimit || null;
		this.args.yLayerLimit = this.args.yLayerLimit || null;

		this.args.static = true;

		this.args.hidden = true;
	}

	update()
	{
		if(this.args.activated && this.args.yLayerSpeed < 18)
		{
			this.args.yLayerSpeed += 1;
		}

		if(this.args.yLayer < this.args.yLayerLimit)
		{
			this.args.yLayer += this.args.yLayerSpeed || 0;
		}

		if(this.args.yLayer > this.viewport.tileMap.mapData.height * this.viewport.tileMap.mapData.tileheight
			&& this.args.yLayer > this.args.yLayerLimit
		){
			this.args.yLayerSpeed = 0;

			this.args.yLayer = this.args.yLayerLimit;

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

		this.viewport.args.shakeY = 15;

		this.viewport.onFrameOut(60, () => {
			this.args.activated = true;
		});

		this.args.yLayerLimit = this.args.yLayerLimit || 4096;

		if(this.args.target && this.viewport.actorsById[ this.args.target ])
		{
			const target = this.viewport.actorsById[ this.args.target ];

			this.viewport.auras.add(target);

			target.activate(other, this);
		}
	}
}
