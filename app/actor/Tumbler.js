import { PointActor } from './PointActor';

export class Tumbler extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.decel  = 0.1;
		this.args.width  = 96;
		this.args.height = 35;
		this.args.type   = 'actor-item actor-tumbler';

		this.args.color = this.args.color || ['red', 'green', 'blue'][Math.trunc(3*Math.random())];

		this.tumbling = false;
		this.bounced  = 0;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoAttr.get(this.box)['data-color'] = 'color';
		this.autoAttr.get(this.box)['data-model']  = 'model';
	}

	update()
	{
		if(this.tumbling && !this.args.falling)
		{
			this.args.xSpeed = this.xSpeedLast;
			this.args.ySpeed = -this.ySpeedLast;
			this.args.y--;
			this.args.falling = true;
			this.bounced++;
		}

		if(this.tumbling)
		{
			// this.args.xSpeed = (this.args.xSpeed || this.xSpeedLast) * 0.7;
		}

		this.noClip = !!this.bounced;

		super.update();
	}

	collideA(other, type)
	{
		if((!other.controllable && !other.isVehicle) || this.args.falling)
		{
			return;
		}

		const speed = other.args.gSpeed || other.args.xSpeed;

		if(Math.abs(speed) > 8)
		{
			this.args.animation = 'tumbling';
			this.args.xSpeed = speed + 5 * Math.random();
			this.args.ySpeed = -Math.abs(speed * 0.25) + -2 * Math.random();
			this.args.falling = true;

			this.tumbling = true
			this.isGhost = true;
		}

		super.collideA(other, type);
	}
}
