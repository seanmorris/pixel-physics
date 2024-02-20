import { PointActor } from './PointActor';

export class Fan extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 32;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-fan';
		this.args.float  = -1;
		this.args.direction = this.args.direction ?? 1;
	}

	get solid() { return false; }

	update()
	{
		const actors = this.viewport.actorsAtLine(
			0 + this.args.x, this.args.y + -16
			, this.args.direction * 64 + this.args.x, this.args.y + -16,
		);

		for(const [actor,collision] of actors)
		{
			if(!actor.controllable)
			{
				continue;
			}

			const force = -20 * ((80-collision.distance) / 64);

			if(!actor.args.falling)
			{
				if(actor.xAxis && Math.sign(actor.xAxis) !== this.args.direction)
				{
					actor.args.gForce = force;
				}
				else //if(Math.abs(actor.args.gSpeed) < 7 || Math.sign(actor.args.gSpeed) !== Math.sign(this.args.direction))
				{
					actor.args.gSpeed += -force * this.args.direction;

					// || Math.sign(actor.args.gSpeed) !== Math.sign(this.args.direction)

					if(Math.abs(actor.args.gSpeed) > 25)
					{
						actor.args.gSpeed = 25 * this.args.direction;
					}
				}
			}
			else
			{
				actor.args.xSpeed = -force * this.args.direction;
			}
		}
	}
}
