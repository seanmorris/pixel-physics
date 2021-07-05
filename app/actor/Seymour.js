import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { SkidDust } from '../behavior/SkidDust';

export class Seymour extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-seymour';

		this.args.normalHeight = 44;
		this.args.rollingHeight = 23;

		this.args.accel     = 0.25;
		this.args.decel     = 0.4;

		this.args.gSpeedMax = 18;
		this.args.jumpForce = 11;
		this.args.gravity   = 0.5;

		this.args.width  = 18;
		this.args.height = 44;
	}

	onAttached()
	{
		this.box = this.findTag('div');
	}

	update()
	{
		const falling = this.args.falling;

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			if(this.yAxis > 0)
			{
				this.args.crouching = true;
			}
			else
			{
				this.args.crouching = false;
			}

			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(this.public.rolling)
			{
				this.box.setAttribute('data-animation', 'rolling');
			}
			else if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'standing');
			}
			else if(speed > maxSpeed * 0.25)
			{
				this.box.setAttribute('data-animation', 'running');
			}
			else if(this.args.moving && gSpeed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			// else if(this.args.crouching || (this.args.standingOn && this.args.standingOn.isVehicle))
			// {
			// 	this.box.setAttribute('data-animation', 'crouching');
			// }
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}
		else if(this.args.jumping)
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		super.update();
	}

	get solid() { return false; }
	get canRoll() { return true; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
