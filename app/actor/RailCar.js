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
		this.args.jumpForce = 8;

		this.dustCount = 0;

		this.args.particleScale = 2;

		this.args.started = false;
	}

	onAttached()
	{
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

		if(this.args.gSpeed !== 0 || this.args.xSpeed !== 0)
		{
			this.sprite.classList.add('moving');

			this.args.started = true;
		}

		if(nowX === lastX)
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
			if(Math.abs(this.args.gSpeed) < Math.abs(this.args.cartSpeed) || Math.sign(this.public.gSpeed) !== Math.sign(this.public.cartSpeed))
			{
				this.args.gSpeed += Math.sign(this.args.cartSpeed) * 0.125;
			}

			this.args.direction = Math.sign(this.args.gSpeed);
		}
		else
		{
			this.args.gSpeed = this.args.xSpeed;
		}
	}

	breakApart()
	{
		if(!this.args.broken)
		{
			const viewport = this.viewport;

			viewport.onFrameOut(500, () => viewport && viewport.actors.remove(this));
			viewport.onFrameOut(200, () => this.sprite.classList.add('broken'));

			if(this.occupant)
			{
				const occupant = this.occupant

				occupant.args.standingOn = false;

				occupant.startle();

				this.args.falling = true;

				this.onNextFrame(()=>{
					occupant.args.xSpeed  = -4 * Math.sign(this.gSpeedLast || this.xSpeedLast);
				});
			}

			this.sprite.classList.add('breaking');

			this.args.broken = true;

			this.args.groundAngle = 0;
			this.args.mode = 0;
		}
	}

	processInputDirect()
	{
		// Don't process input at all.
	}

	jump()
	{
		// Don't process input at all.
	}

	get solid() { return !this.args.broken && !this.occupant; }
}
