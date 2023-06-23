import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
// import { Sfx } from '../audio/Sfx';

export class TruckCab extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-truck-cab';

		this.args.width   = 49;
		this.args.height  = 51;
		this.args.gravity = 0.4;
		this.args.float   = -1;
		this.noClip = 1;

		this.args.driver = this.args.driver || null;

		this.args.ramming = true;
	}

	collideA(other,type)
	{
		if(this.args.destroyed)
		{
			return;
		}

		if(other.break)
		{
			other.break(this);
			return;
		}

		if(other.pop)
		{
			other.pop(this);
			return;
		}

		if(!other.controllable)
		{
			return;
		}

		other.damage(this);
	}
}
