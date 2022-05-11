import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { CanPop } from '../mixin/CanPop';

export class Dish extends Mixin.from(PointActor, CanPop)
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.width  = 46;
		this.args.height = 50;
		this.args.type   = 'actor-item actor-dish';
	}

	get solid() { return false; }
}
