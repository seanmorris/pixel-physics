import { Vehicle } from './Vehicle';
import { Platformer } from '../behavior/Platformer';

export class EggMobile extends Vehicle
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-vehicle actor-eggmobile';

		this.args.accel     = 0.15;
		this.args.decel     = 0.8;

		this.args.gSpeedMax = 15;
		this.args.xSpeedMax = 45;
		this.args.ySpeedMax = 45;

		this.args.jumpForce = 12;
		this.args.gravity   = 0.6;

		this.args.width  = 28;
		this.args.height = 20;

		this.args.yMargin = 42;

		this.args.falling = true;
		this.args.flying = true;
		this.args.float = -1;
	}

	update()
	{
		if(this.bMap('checkBelow', this.x, this.y).get(Platformer))
		{
			this.args.y--;
		}

		if(Math.abs(this.yAxis) > 0.5)
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

				if(Math.abs(ySpeed) < 0.1)
				{
					ySpeed = 0;
				}
				else if(Math.abs(ySpeed) > 4)
				{
					ySpeed = 4 * Math.sign(ySpeed);
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
			if(Math.abs(this.args.xSpeed) <= 1)
			{
				this.args.xSpeed = 0;
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
		// else
		// {
		// 	this.args.xSpeed = Math.ceil(this.args.xSpeed * this.args.decel);
		// }

		if(!this.occupant)
		{
			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
		}

		this.args.falling = true;
		this.args.flying  = true;

		this.args.mode = 0;

		this.args.cameraMode = 'aerial';

		super.update();

	}

	command_4()
	{
		this.args.direction = -1;
		this.args.facing = 'left';
	}

	command_5()
	{
		this.args.direction = 1;
		this.args.facing = 'right';
	}

	get solid() { return !this.occupant; }
}
