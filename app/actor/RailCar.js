import { Vehicle } from './Vehicle';

import { Tag } from 'curvature/base/Tag';

export class RailCar extends Vehicle
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-rail-car';

		this.args.width  = 32;
		this.args.height = 48;

		this.removeTimer = null;

		this.args.cartSpeed = this.args.cartSpeed || 15;

		this.args.gSpeedMax = 20;
		this.args.decel     = 0.00;
		this.args.accel     = 0.75;
		this.args.gravity   = 1;
		// this.args.ignore    = -1;

		this.args.seatHeight = 44;

		this.args.skidTraction = 0.05;
		this.args.jumpForce = 12;

		this.dustCount = 0;

		this.args.particleScale = 2;

		this.args.started = false;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.frontWheel = new Tag('<div class = "rail-car-wheel rail-car-wheel-front">');
		this.backWheel = new Tag('<div class = "rail-car-wheel rail-car-wheel-back">');

		this.frontFrag = new Tag('<div class = "rail-car-frag rail-car-frag-front">');
		this.backFrag = new Tag('<div class = "rail-car-frag rail-car-frag-back">');

		this.sprite.appendChild(this.frontWheel.node);
		this.sprite.appendChild(this.backWheel.node);

		this.sprite.appendChild(this.frontFrag.node);
		this.sprite.appendChild(this.backFrag.node);
	}

	update()
	{
		this.originalSpeed = this.args.gSpeed || this.args.xSpeed;

		const lastX = this.x;

		super.update();

		if(!this.sprite)
		{
			return;
		}

		const nowX = this.x;

		if(this.args.gSpeed !== 0 || this.args.hSpeed !== 0 || this.args.xSpeed !== 0)
		{
			this.sprite.classList.add('moving');

			this.args.started = true;
		}

		if(nowX === lastX && !this.args.broken && !this.args.hSpeed)
		{
			this.sprite.classList.remove('moving');

			if(this.args.started)
			{
				const viewport = this.viewport;

				if(this.args.falling && (!this.args.xSpeed && !this.args.ySpeed))
				{
					this.breakApart();
				}
				else if(!this.args.falling && !this.args.gSpeed)
				{
					this.breakApart();
				}
			}
		}

		if(this.occupant && !this.args.falling)
		{
			const speed = this.args.hSpeed || this.args.gSpeed;

			if(Math.abs(speed) < Math.abs(this.args.cartSpeed) || Math.sign(speed) !== Math.sign(this.args.cartSpeed))
			{
				if(this.args.hSpeed)
				{
					this.args.hSpeed += Math.sign(this.args.cartSpeed) * 0.125;
				}
				else
				{
					this.args.gSpeed += Math.sign(this.args.cartSpeed) * 0.125;
				}

				if(Math.abs(this.args.gSpeed) < 1)
				{
					this.args.gSpeed = Math.sign(this.args.gSpeed);
				}
			}

			this.args.direction = Math.sign(this.args.hSpeed || this.args.gSpeed);
		}
		else
		{
			if(this.args.hSpeed)
			{
				this.args.hSpeed = this.args.xSpeed;
			}
			else if(this.args.xSpeed)
			{
				this.args.gSpeed = this.args.xSpeed;
			}
		}
	}

	breakApart()
	{
		if(!this.args.broken)
		{
			const viewport = this.viewport;

			// viewport.onFrameOut(140, () => viewport && viewport.actors.remove(this));
			// viewport.onFrameOut(120, () => this.sprite.classList.add('broken'));

			if(this.occupant)
			{
				this.occupant.startle();
			}

			this.sprite.classList.add('breaking');

			this.args.broken = true;

			this.args.groundAngle = 0;
			this.args.mode = 0;

			this.args.dead = true;
		}
	}

	sleep()
	{
		this.args.x = this.def.get('x');
		this.args.y = this.def.get('y');

		this.args.dead = false;

		this.args.groundAngle = 0;
		this.args.gSpeed = 0;
		this.args.xSpeed = 0;
		this.args.ySpeed = 0;

		this.sprite.classList.remove('breaking');
		this.sprite.classList.remove('broken');

		this.args.broken = false;
		this.args.started = false;

		super.sleep();
	}

	processInputDirect()
	{
		// Don't process input at all.
	}

	// jump()
	// {
	// 	// Don't process input at all.
	// }

	get solid() { return !this.args.broken && !this.occupant; }
}
