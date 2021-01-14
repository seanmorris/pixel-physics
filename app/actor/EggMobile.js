import { PointActor } from './PointActor';

export class EggMobile extends PointActor
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

	collideA(other)
	{
		if(!other.controllable)
		{
			return false;
		}

		if(other.y >= this.y)
		{
			return false;
		}

		if(other.isVehicle)
		{
			return false;
		}

		return true;
	}

	update()
	{
		if(Math.abs(this.yAxis) > 0.1)
		{
			if(Math.abs(this.args.ySpeed) < this.args.ySpeedMax)
			{

				let ySpeed = this.args.ySpeed

				if(Math.sign(this.yAxis) === Math.sign(this.args.ySpeed))
				{
					ySpeed += (this.yAxis * this.args.accel);
				}
				else
				{
					ySpeed += (this.yAxis * this.args.accel) * 2;
				}

				ySpeed = Math.floor(ySpeed * 1000) / 1000;

				this.args.ySpeed = ySpeed;
			}
		}
		else
		{
			this.args.ySpeed = 0;
		}

		if(!this.xAxis)
		{
			this.args.xSpeed = 0;
		}

		super.update();

		this.args.falling = true;
		this.args.flying = true;
	}

	get solid() { return true; }
	get isVehicle() { return true; }
}
