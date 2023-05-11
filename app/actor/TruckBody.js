import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
// import { Sfx } from '../audio/Sfx';

export class TruckBody extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-truck-body';

		this.args.width   = 145;
		this.args.height  = 48;
		this.args.gravity = 0.4;
		this.args.float   = -1;
		this.noClip = 1;

		this.args.driver = this.args.driver || null;
	}

	collideA(other,type)
	{
		if(!other.controllable)
		{
			return;
		}

		other.damage(this);
	}
}
