import { PointActor } from './PointActor';

export class Coconut extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-coconut';

		this.args.width  = 12;
		this.args.height = 13;

		this.args.size   = 4;

		this.args.nourishment = 0.05;

		this.bindTo('carriedBy', carrier => {
			if(this.cX) { this.cX(); this.cX = null; }
			if(this.cY) { this.cY(); this.cY = null; }

			if(this.carriedBy)
			{
				const carrier = this.carriedBy;

				this.carriedBy = null;

				this.args.xSpeed = carrier.args.xSpeed;
				this.args.ySpeed = carrier.args.falling ? carrier.args.ySpeed : 0;

				this.args.xSpeed += Math.sign(carrier.args.gSpeed || carrier.args.xSpeed) * 4;
				this.args.ySpeed -= 4;

				carrier.carrying.delete(this);

				this.args.falling = true;
				this.args.float = 0;
			}

			if(carrier)
			{
				this.cX = carrier.args.bindTo('x', v => this.args.x = v + carrier.args.direction * carrier.xHold);
				this.cY = carrier.args.bindTo('y', v => this.args.y = v + -carrier.yHold);

				this.args.xSpeed = 0;
				this.args.ySpeed = 0;

				carrier.carrying.add(this);

				this.args.float = -1;
			}
		});
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--size'] = 'size';
	}

	lift(actor)
	{
		if(this.carriedBy === actor)
		{
			this.carriedBy = null;

			return;
		}

		this.carriedBy = actor;
	}

	get solid() { return false; }
	get rotateLock() { return true; }

	sleep()
	{
		if(this.carriedBy)
		{
			return;
		}

		if(!this.viewport)
		{
			return;
		}

		this.viewport.actors.remove(this);
	}
}
