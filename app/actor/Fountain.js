import { PointActor } from './PointActor';

export class Fountain extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 72;
		this.args.height = 120;
		this.args.float  = -1;

		this.args.type   = 'actor-item actor-fountain';
	}

	collideA(other)
	{
		if(!other.controllable || !other.args.falling)
		{
			return;
		}

		if(other.y > this.y + -this.args.height * 0.5)
		{
			other.args.x = this.x;
		}

		if(other.args.ySpeed > 0)
		{
			other.args.ySpeed *= 0.75;
		}

		if(other.args.ySpeed > -20 && Math.abs(this.x - other.x) < 8)
		{
			other.args.ySpeed -= 0.6;
		}
	}

	get solid() { return false; }
}
