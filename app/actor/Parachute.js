import { PointActor } from './PointActor';

export class Parachute extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 32;
		this.args.height = 22;
		this.args.type   = 'actor-item actor-parachute';
		this.args.float  = -1;
		this.args.z  = -1;

		this.attachedTo = null;
	}

	get solid() { return false; }

	updateEnd()
	{
		if(this.attachedTo)
		{
			this.args.x = this.attachedTo.args.x + -8 * this.attachedTo.args.direction;
			this.args.y = this.attachedTo.args.y + -this.attachedTo.args.normalHeight * 1;

			if(this.attachedTo.args.ySpeed > 2)
			{
				this.attachedTo.args.ySpeed = 2;
				this.attachedTo.args.animation = 'dropping';
				this.args.hidden = false;
			}
			else
			{
				this.args.hidden = true;
			}
		}

		super.updateEnd();
	}

	collideA(other)
	{
		if(this.attachedTo || !other.controllable)
		{
			return;
		}

		this.attachedTo = other;
	}
}
