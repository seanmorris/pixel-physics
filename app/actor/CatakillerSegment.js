import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { CanPop } from '../mixin/CanPop';

export class CatakillerSegment extends Mixin.from(PointActor)
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-catakiller-segment';

		this.args.width  = 16;
		this.args.height = 16;
		this.args.following = this.args.following || false;
		this.args.willMove = true;
		this.args.popped = false;

		this.args.bounces = 1;
	}

	collideA(other, type)
	{
		// if(!other.controllable || (this.args.popped && this.args.ySpeed < 0))
		if(!other.controllable || this.args.popped)
		{
			return;
		}

		if(this.args.position === 0 && this.args.head)
		{
			this.args.head.collideA(other, type);
		}
		else
		{
			other.damage(this);
		}
	}

	onRendered()
	{
		super.onRendered();

		if(this.box && this.args.position % 2 === 0)
		{
			this.autoStyle.get(this.box)['--space'] = 'space';
		}
	}

	update()
	{
		if(this.args.leader && this.args.head && !this.args.popped)
		{
			const leaderX = this.args.leader.args.x;

			const space = Math.abs(this.args.x - leaderX);
			let speed = Math.abs(this.args.head.gSpeedLast || 0);

			this.args.space = space;

			if(space < 9)
			{
				this.args.willMove = false;
			}
			else if(space > 12)
			{
				this.args.willMove = true;
				// speed *= 1.5;
			}

			if(this.args.willMove)
			{
				this.args.gSpeed = speed * -Math.sign(this.args.x - leaderX);
			}
			else
			{
				this.args.gSpeed = 0;
			}

			if(this.args.gSpeed !== 0)
			{
				this.args.facing = this.args.gSpeed > 0 ? 'left' : 'right';
			}

			this.args.groundAngle = 0;
		}

		const yLast = this.args.y;

		super.update();

		if(this.args.popped && this.args.y === yLast)
		{
			if(this.args.bounces > 0)
			{
				this.args.ySpeed = -Math.max(this.ySpeedLast || 5);
				this.args.xSpeed = (this.gSpeedLast || this.xSpeedLast || 0) + Math.sign(this.xSpeedLast || 0);
				this.args.falling = true;
				this.args.bounces--;
			}
			else
			{
				this.noClip = true;
				this.args.ySpeed = Math.max(this.ySpeedLast || 5);
				this.args.falling = true;
			}
		}
	}

	get solid() {return false}
	get rotateLock() {return true}
}
