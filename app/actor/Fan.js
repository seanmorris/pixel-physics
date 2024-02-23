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
		const actors = this.viewport.actorsAtPoint(
			this.args.x + 80 * this.args.direction
			, this.args.y
			, 160
			, 64
		);

		for(const actor of actors)
		{
			if(!actor.controllable)
			{
				continue;
			}

			if(Math.abs(actor.args.gSpeed) > 20)
			{
				actor.args.gSpeed = Math.sign(actor.args.gSpeed) * 20;
			}

			const distance = Math.abs(this.args.x - actor.args.x);
			const force = -20 * Math.min(1, 1 - ((distance - 20) / 160)) ** 3;

			if(!actor.args.falling)
			{
				if(actor.xAxis && Math.sign(actor.xAxis) !== this.args.direction && !actor.args.rolling)
				{
					actor.args.gForce = force;
				}
				else
				{
					actor.args.gSpeed += -force * this.args.direction;

					if(Math.abs(actor.args.gSpeed) > 25)
					{
						actor.args.gSpeed = 25 * this.args.direction;
					}
				}
			}
			else
			{
				actor.args.xSpeed += -force * this.args.direction;

				if(Math.abs(actor.args.xSpeed) > 25)
				{
					actor.args.gSpeed = 25 * this.args.direction;
				}
			}
		}
	}
}
