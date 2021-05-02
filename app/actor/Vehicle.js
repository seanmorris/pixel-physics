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
		if(other.controllable)
		{
			if(other.args.ySpeed > 0)
			{
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
			other.args.ySpeed  = -other.args.ySpeed;
			other.args.xSpeed  = other.args.xSpeed || (other.args.direction * 5);

			if(other.args.ySpeed > -5)
			{
				other.args.ySpeed = -5;
			}
		}
	}

	get isVehicle() { return true; }
}
