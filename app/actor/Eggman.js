import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class Eggman extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type      = 'actor-item actor-eggman';

		this.args.accel     = 0.15;
		this.args.decel     = 0.3;

		this.args.normalHeight = 40;
		this.args.rollingHeight = 23;

		this.args.gSpeedMax = 15;
		this.args.jumpForce = 18;
		this.args.gravity   = 1;

		this.args.width  = 32;
		this.args.height = 57;
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

		else if(this.yAxis > 0)
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

		if(falling)
		{
			this.box.setAttribute('data-animation', 'jumping');
			this.args.height = this.public.rollingHeight;
		}
		else if(this.public.rolling)
		{
			this.args.height = this.public.rollingHeight;
			if(this.public.direction !== Math.sign(this.public.gSpeed))
			{
				this.args.direction = Math.sign(this.public.gSpeed);

				if(this.args.direction < 0)
				{
					this.args.facing = 'left';
				}
				else
				{
					this.args.facing = 'right';
				}
			}

			this.box.setAttribute('data-animation', 'rolling');
		}
		else
		{
			this.args.height = this.public.normalHeight;

			if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(speed > maxSpeed / 2)
			{
				this.box.setAttribute('data-animation', 'running');
			}
			else if(this.args.moving && gSpeed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else if(this.args.crouching || (this.standingOn && this.standingOn.isVehicle))
			{
				this.box.setAttribute('data-animation', 'crouching');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}

		super.update();
	}

	get solid() { return false; }
	get canRoll() { return true; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
