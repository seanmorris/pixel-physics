import { PointActor } from './PointActor';

export class Vehicle extends PointActor
{
	update()
	{
		if(this.occupant)
		{
			this.running  = this.occupant.running;
			this.crawling = this.occupant.crawling;
		}

		super.update()
	}

	collideA(other, type)
	{
		if(other.noClip)
		{
			return false;
		}

		if(other.controllable)
		{
			if(other.args.falling && this.y + -other.y + 24 <= this.args.seatHeight)
			{
				return false;
			}
			else if(other.args.ySpeed > 0 && !this.occupant)
			{
				const seatHeight  = this.args.seatHeight || 0;
				other.args.ySpeed = 0;
				other.args.y = this.y + -seatHeight + 1;
				other.args.x = this.x;

				other.args.standingOn = this;

				return true;
			}
			else
			{
				return false;
			}
		}

		if(other.y >= this.y)
		{
			return false;
		}

		if(!other.args.float)
		{
			other.args.ySpeed = -other.args.ySpeed;
			other.args.xSpeed = other.args.xSpeed || (other.args.direction * 5);

			if(other.args.ySpeed > -5)
			{
				other.args.ySpeed = -5;
			}
		}

		return false;
	}

	standBelow(other)
	{
		if(!other.controllable)
		{
			other.args.ySpeed = -other.args.ySpeed;
			other.args.xSpeed = other.args.xSpeed || (other.args.direction * 5);

			if(other.args.ySpeed > -5)
			{
				other.args.ySpeed = -5;
			}
		}
	}

	get isVehicle() { return true; }
}
