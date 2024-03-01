import { PointActor } from './PointActor';

export class Propeller extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 128;
		this.args.height = 16;
		this.args.type   = 'actor-item actor-propeller';
		this.args.float  = -1;
	}

	get solid() { return false; }

	update()
	{
		const hover = 160;

		const actors = this.viewport.actorsAtPoint(
			this.args.x, this.args.y
			, this.args.width, hover
		);

		for(const actor of actors)
		{
			if(actor.args.float || actor.args.ySpeed < -8 || !actor.args.falling)
			{
				continue;
			}

			const yOther = this.args.y - actor.args.y;
			const magnitude = ((hover + -yOther) / hover) ** 4;

			actor.args.ySpeed -= magnitude * Math.max(1.5, actor.args.ySpeed);

			actor.args.animation = 'hovering';
			actor.args.jumping = false;
			actor.args.groundAngle = 0;
		}
	}
}
