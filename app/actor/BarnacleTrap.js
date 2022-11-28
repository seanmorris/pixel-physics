import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { Constrainable } from '../mixin/Constrainable';

export class BarnacleTrap extends Mixin.from(PointActor, Constrainable)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-barnacle-trap';

		this.args.width  = 8;
		this.args.height = 8;
		this.args.ropeLength = 0;
		// this.args.float  = -1;

		// this.args.airAngle = -Math.PI;

		this.stuck = new Map;
		this.noClip = true;

		this.onRemove(() => {
			for(const [other, entry] of this.stuck)
			{
				other.args.float = 0;
				other.args.stuck = false;
			}
		});
	}

	update()
	{
		if(!this.others.tiedTo)
		{
			super.update();
		}
	}

	updateEnd()
	{
		super.update();

		for(const [other, entry] of this.stuck)
		{
			if(this.viewport.args.frameId % 25 === 0)
			{
				entry.wiggles = Math.min(8, 1 + entry.wiggles);
			}
		}

		const tiedTo = this.others.tiedTo;

		if(tiedTo)
		{
			this.setPos();
		}

		for(const [other, entry] of this.stuck)
		{
			other.args.xSpeed = other.xAxis;
			other.args.ySpeed = 0;

			if(other.args.mercy || other.args.dead || entry.wiggles <= 0)
			{
				this.stuck.delete(other);
				this.ignores.set(other, 15);
				other.args.stuck = false;
				if(!other.args.dead)
				{
					other.args.float = 0;
				}
			}
			else
			{
				this.args.xSpeed += other.xAxis * 0.1;

				if(Math.abs(this.args.xSpeed) > 3)
				{
					this.args.xSpeed = 3 * Math.sign(this.args.xSpeed);
				}

				other.args.x = this.args.x;
				other.args.y = this.args.y + other.args.height + -this.args.height;
				other.args.float = -1;
				other.args.falling  = true;
				other.dashed        = false;
				other.args.stuck    = true;
				other.args.jumping  = false;
				other.args.spinning = false;
				other.args.animation  = 'walking';
				other.args.cameraBias = 0.2;
			}

			if(other.xAxis)
			{
				if(Math.sign(entry.xAxisLast) !== Math.sign(other.xAxis))
				{
					entry.wiggles--;
				}

				entry.xAxisLast = other.xAxis;
			}
		}

		if(Math.abs(this.args.xSpeed) < 2
			&& this.args.ySpeed > 0
			&& this.args.ySpeed < 2
			&& this.args.rope > 32
		){
			this.args.xSpeed = 2 * Math.sign(this.args.xSpeed);
		}

		super.updateEnd();
	}

	collideA(other)
	{
		if(other === this.owner)
		{
			return;
		}

		if(!other.controllable && typeof other.pop !== 'function')
		{
			return;
		}

		if(other.args.mercy || other.args.dead || this.stuck.size)
		{
			return;
		}

		if(!this.stuck.has(other))
		{
			this.stuck.set(other, {xAxisLast: 0, wiggles: 8, yDiff: other.args.y - this.args.y});
			this.args.xSpeed = other.args.xSpeed || other.args.gSpeed;

			this.args.x = other.args.x;

		}
	}

	get solid() {return false}
}
