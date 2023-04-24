import { PointActor } from './PointActor';

export class WaterSpout extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.rotation = objDef.rotation;
		obj.args.height = objDef.height;

		return obj;
	}

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-water-spout';

		this.args.float  = this.args.float  ?? -1;
		this.args.static = this.args.static ?? true;

		this.args.width  = args.width  || 32;
		this.args.height = args.height || 64;
	}

	get solid() { return false; }
}
