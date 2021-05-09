import { Vehicle } from './Vehicle';

export class EggMobile extends Vehicle
{
	float = -1;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-vehicle actor-eggmobile';

		this.args.accel     = 0.15;
		this.args.decel     = 0.8;

		this.args.gSpeedMax = 15;
		this.args.xSpeedMax = 25;
		this.args.ySpeedMax = 30;

		this.args.jumpForce = 12;
		this.args.gravity   = 0.6;

		this.args.width  = 54;
		this.args.height = 20;

		this.args.yMargin = 42;

		this.args.falling = true;
		this.args.flying = true;
	}

	update()
	{
		if(Math.abs(this.yAxis) > 0.1)
		{
			if(Math.abs(this.args.ySpeed) < this.args.ySpeedMax)
			{
				let ySpeed = this.args.ySpeed;

				if(Math.sign(this.yAxis) === Math.sign(this.args.ySpeed))
				{
					ySpeed += (this.yAxis * this.args.accel) * 3;
				}
				else
				{
					ySpeed += (this.yAxis * this.args.accel) * 6;
				}

				if(ySpeed > 0)
				{
					ySpeed = Math.floor(ySpeed * 1000) / 1000;
				}
				else
				{
					ySpeed = Math.ceil(ySpeed * 1000) / 1000;
				}

				this.args.ySpeed = ySpeed;
			}
		}
		else
		{
			this.args.ySpeed = this.args.ySpeed * this.args.decel;
		}

		if(!this.xAxis)
		{
			if(Math.abs(this.public.xSpeed) <= 1)
			{
				this.public.xSpeed = 0;
			}

			if(this.args.xSpeed > 0)
			{
				this.args.xSpeed = Math.floor(this.args.xSpeed * this.args.decel);
			}
			else
			{
				this.args.xSpeed = Math.ceil(this.args.xSpeed * this.args.decel);
			}
		}

		if(!this.occupant)
		{
			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
		}

		this.args.falling = true;
		this.args.flying  = true;

		this.args.mode = 0;

		super.update();

	}

	get solid() { return !this.occupant; }
}
