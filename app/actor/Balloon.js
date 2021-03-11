import { PointActor } from './PointActor';

export class Balloon extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-balloon';

		this.args.float  = -1;

		this.args.width  = 32;
		this.args.height = 32;

		this.args.airAngle = -Math.PI;
	}

	update()
	{
		if(this.attachedTo)
		{
			const other = this.attachedTo;
			const attach = other.rotatePoint(0, other.args.height + 8);

			this.args.x = other.x + attach[0];
			this.args.y = other.y + attach[1];

			this.args.airAngle = other.realAngle;
		}
	}

	collideA(other)
	{
		if(!other.controllable)
		{
			return;
		}

		this.attachedTo = other;
	}

	// get solid() { return false; }
	// get effect() { return true; }
}
