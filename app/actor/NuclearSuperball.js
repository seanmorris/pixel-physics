import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class NuclearSuperball extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.gSpeedMax = 150;
		this.args.accel     = 2;
		this.args.jumpForce = 20;


		this.willStick = true;
		this.stayStuck = true;
	}

	get solid() { return false; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
