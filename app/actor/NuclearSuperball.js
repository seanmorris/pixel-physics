import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class NuclearSuperball extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.gSpeedMax = 75;
		this.args.accel = 0.4;
	}

	get solid() { return false; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
