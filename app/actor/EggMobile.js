import { Vehicle } from './Vehicle';

export class EggMobile extends Vehicle
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-vehicle actor-eggmobile';

		this.args.accel     = 0.15;
		this.args.decel     = 0.8;

		this.args.gSpeedMax = 20;
		this.args.xSpeedMax = 20;
		this.args.ySpeedMax = 20;

		this.args.jumpForce = 12;
		this.args.gravity   = 0.6;

		this.args.width  = 54;
		this.args.height = 20;
		this.args.float  = -1;

		this.args.yMargin = 42;

		this.args.falling = true;
		this.args.flying = true;
	}

	update()
	{
		this.args.falling = false;

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

				ySpeed = Math.floor(ySpeed * 1000) / 1000;

				this.args.ySpeed = ySpeed;
			}
		}
		else
		{
			this.args.ySpeed = this.args.ySpeed * this.args.decel;
		}

		if(!this.xAxis)
		{
			this.args.xSpeed = this.args.xSpeed * this.args.decel;
		}

		this.args.falling = true;
		this.args.flying  = true;

		this.args.mode = 0;

		super.update();

	}

	get solid() { return true; }
}
