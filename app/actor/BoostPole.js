import { PointActor } from './PointActor';

export class BoostPole extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 48;
		this.args.height = 8;
		this.args.type   = 'actor-item actor-boost-pole';
		this.args.float  = -1;
		this.args.platform = 1;
		this.args.bend = 0;
		this.args.z = 0;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--bend'] = 'bend';
	}

	updateStart()
	{
		this.args.bend = 0;
	}

	collideA(other)
	{
		if(other.args.static || other.isRegion || this.ignores.has(other) || other.noClip)
		{
			return;
		}

		if(other.args.float || other.args.ySpeed <= 0)
		{
			return;
		}

		if(other.args.ySpeed > 2)
		{
			other.args.ySpeed = 1;
			other.args.y = this.args.y + -7;
		}

		const yOther = other.args.y + -this.args.y + 8;
		const xOther = other.args.x + -this.args.x + 24 * this.args.direction;
		const force = Math.min(1, Math.max(0, (xOther * this.args.direction) / 48));

		other.args.animation = 'rolling';

		if(Math.abs(other.args.xSpeed) > 0.5)
		{
			other.args.xSpeed = Math.sign(other.args.xSpeed) * 0.5;
		}

		if(force > 0.45)
		{
			if(yOther > 10 * force)
			{
				other.args.ySpeed = -15 * force;
			}
			else if(yOther > 8 * force)
			{
				other.args.xSpeed *= 0.5;
				other.args.ySpeed = 0.25;
			}
			else
			{
				other.args.ySpeed = 0.5;
			}

			this.args.bend = Math.max(0, Math.min(3, Math.floor(yOther / 2)));
		}
		else
		{
			this.args.bend = 0;
			other.args.ySpeed = 0;
			other.args.xSpeed += 0.5 * this.args.direction;
			other.args.float = 1;
		}

		return false;
	}

	get solid() { return false; }
}
