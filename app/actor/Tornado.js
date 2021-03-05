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

		this.args.gSpeedMax = 14;
		this.args.decel     = 0.30;
		this.args.accel     = 0.75;

		this.args.seatHeight = 14;

		this.args.flySpeed = 0;

		this.args.skidTraction = 0.95;

		this.dustCount = 0;

		this.args.flyAngle = -0.25;

		this.args.particleScale = 2;

		this.args.float  = -1;

		this.args.thrusting   = false;
		this.args.landingGear = true;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.plane     = new Tag('<div class = "plane">');
		this.fuselage  = new Tag('<div class = "fuselage">');
		this.propeller = new Tag('<div class = "propeller">');
		this.thruster  = new Tag('<div class = "thruster">');
		this.frontGear = new Tag('<div class = "front-landing-gear">');
		this.rearGear  = new Tag('<div class = "rear-landing-gear">');

		this.sprite.appendChild(this.plane.node);

		this.plane.appendChild(this.thruster.node);
		this.plane.appendChild(this.propeller.node);
		this.plane.appendChild(this.frontGear.node);
		this.plane.appendChild(this.rearGear.node);
		this.plane.appendChild(this.fuselage.node);

		this.args.bindTo('landingGear', v => {
			if(this.plane)
			{
				this.plane.setAttribute('data-landing-gear', v);
			}
		});

		this.args.bindTo('thrusting', v => {
			if(this.plane)
			{
				this.plane.setAttribute('data-thrusting', v);
			}
		});
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
		}

		if(!this.public.thrusting && Math.abs(this.public.xSpeed) < 8)
		{
			this.args.float  = 0;
			this.args.flying = false;
		}
		else if(this.public.falling)
		{
			this.args.float  = -1;
			this.args.flying = true;
		}

		const maxAirSpeed = 48;

		if(!this.public.thrusting && Math.abs(this.public.xSpeed) > maxAirSpeed)
		{
			this.args.xSpeed -= Math.sign(this.public.xSpeed) * 0.2;
		}
		if(this.public.thrusting && (Math.sign(this.args.xSpeed) !== this.public.direction || Math.abs(this.public.xSpeed) < maxAirSpeed))
		{
			this.args.xSpeed += Math.sign(this.public.direction) * 4;

			if(this.args.xSpeed === 0)
			{
				this.args.xSpeed += Math.sign(this.public.direction) * 4;
			}
		}
		else if(Math.abs(this.public.xSpeed) > 10 && !this.public.thrusting)
		{
			this.args.xSpeed *= 0.99;
		}

		if(this.public.flying)
		{
			if(this.public.ySpeed === 0)
			{
				this.args.flyAngle = 0;
			}

			if(this.public.landingGear)
			{
				this.args.flyAngle += 0.005;
			}
			else
			{
				if(Math.abs(this.args.flyAngle) > 0.00125)
				{
					this.args.flyAngle -= 0.00125 * Math.sign(this.args.flyAngle);
				}
				else
				{
					this.args.flyAngle = 0;
				}
			}

			if(!this.public.xSpeed)
			{
				this.public.flying = false;
				return;
			}

			const newAngle = this.args.flyAngle + Math.sign(this.yAxis) * 0.035;

			if(this.args.flyAngle > 0)
			{
				this.args.xSpeed *= 1.0025;
			}
			else if(this.args.flyAngle > 0)
			{
				this.args.xSpeed /= 1.015;
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
			this.args.landingGear = true;
			this.args.flySpeed    = 0;
		}

		super.update();

		this.args.cameraMode = 'airplane';
	}

	command_1()
	{
		if(this.args.falling)
		{
			this.args.landingGear = !this.args.landingGear;
		}
	}

	hold_2()
	{
		if(this.args.falling)
		{
			this.args.thrusting = true;
			this.args.flying = true;
		}
	}

	release_2()
	{
		this.args.thrusting = false;
	}

	get solid() { return true; }
}
