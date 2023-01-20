import { PointActor } from './PointActor';

export class LightSource extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		if(objDef.polygon)
		{
			obj.args.polygon = objDef.polygon.map(p => Object.assign({}, p));
		}

		return obj;
	}

	constructor(...args)
	{
		super(...args);
		this.args.type   = 'actor-item actor-light-source';
		this.args.hidden = true;
		this.args.static = true;
		this.args.float  = -1;
	}

	get solid() { return false; }
}
