import { Vehicle } from './Vehicle';

import { Tag } from 'curvature/base/Tag';

export class Tornado extends Vehicle
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-tornado';

		this.args.width  = 64;
		this.args.height = 48;

		this.removeTimer = null;

		this.args.gSpeedMax = 10;
		this.args.decel     = 0.30;
		this.args.accel     = 0.75;

		this.args.seatHeight = 14;

		this.args.flySpeed = 0;

		this.args.skidTraction = 0.95;

		this.dustCount = 0;

		this.args.flyAngle = -0.25;

		this.args.particleScale = 2;

		this.args.float  = -1;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');
	}

	update()
	{
		if(!this.occupant || !this.args.falling)
		{
			this.args.flying = false;
			this.args.flyAngle = this.public.falling ? 0.26 : -0.26;
			this.args.float = 0;
		}

		if(!this.public.flying
			&& this.public.falling
			&& Math.abs(this.args.flyAngle) < (Math.PI / 2)
			&& Math.sign(this.public.xSpeed) === this.public.direction
		){
			this.args.flyAngle = -0.26;
			this.args.flying = true;
		}

		if(this.public.flying)
		{
			if(this.args.ySpeed === 0)
			{
				this.args.flyAngle = 0;
			}

			this.args.flyAngle += 0.00125;

			if(!this.public.xSpeed)
			{
				this.public.flying = false;
				return;
			}

			const newAngle = this.args.flyAngle + Math.sign(this.yAxis) * 0.05;

			if(Math.abs(this.public.xSpeed) > 64)
			{
				this.args.xSpeed = Math.sign(this.public.xSpeed) * 64;
			}

			if(this.args.flyAngle > 0)
			{
				this.args.xSpeed *= 1.005;
			}
			else if(this.args.flyAngle > 0)
			{
				this.args.xSpeed /= 1.005;
			}


			if(this.yAxis && Math.abs(newAngle) < (Math.PI / 2))
			{
				this.args.flyAngle = newAngle;
			}

			if(Math.sign(this.public.xSpeed) === this.public.direction)
			{
				const speed = this.public.xSpeed || this.public.gSpeed;

				this.args.ySpeed = Math.sin(this.public.flyAngle) * speed * this.public.direction * 2;
			}
		}
		else
		{
			this.args.flySpeed = 0;
		}

		super.update();

		this.args.cameraMode = 'airplane';
	}

	get solid() { return true; }
}
