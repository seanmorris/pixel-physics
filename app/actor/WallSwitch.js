import { Sfx } from '../audio/Sfx';
import { PointActor } from './PointActor';

export class WallSwitch extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = this.args.width  || 12;
		this.args.height = this.args.height || 20;
		this.args.type   = 'actor-item actor-wall-switch';
		this.args.z = 100;
		this.args.float = -1;
	}

	collideA(other)
	{
		if(!other.controllable || this.args.active)
		{
			if(this.args.toggle)
			{
				this.ignores.set(other, 8);
				this.args.active = false;
				Sfx.play('SWITCH_HIT');
			}

			return;
		}

		this.ignores.set(other, 15);
		this.args.active = true;
		Sfx.play('SWITCH_HIT');
	}

	sleep()
	{
		this.args.active = false;
	}

	get solid() { return false; }
}
