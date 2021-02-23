import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class NuclearSuperball extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.gSpeedMax = 20;
		this.args.accel     = 2;
	}

	get solid() { return false; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
