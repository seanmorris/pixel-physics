import { PointActor } from './PointActor';

export class WaterJet extends PointActor
{
	float = -1;

	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		obj.args.x      = objDef.x + (objDef.width / 2);

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.width  = this.public.width  || 32;
		this.args.height = this.public.height || 64;
		this.args.type   = 'actor-item actor-water-jet';
	}

	get solid() { return false; }
	get isEffect() { return true; }
	get isGhost() { return true; }
}
