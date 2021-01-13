import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class NuclearSuperball extends PointActor
{
	constructor(...args)
	{
		super(...args);
	}

	get solid() { return false; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
