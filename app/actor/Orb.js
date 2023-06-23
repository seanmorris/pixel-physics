import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { Pushable } from '../mixin/Pushable';

export class Orb extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-orb';

		this.args.width   = 18;
		this.args.height  = 48;
		this.args.rolled  = 0;

		this.args.accel = 0.0;
		this.args.decel = 0;

		this.args.bindTo('x', (v,k,t,d,p) => this.args.rolled += 0.5 * Number(v - p || 0));

		this.args.gravity = 1.35;

		this.args.maxFollow = this.args.maxFollow || null;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--rolled'] = 'rolled';
	}

	updateStart()
	{
		super.updateStart();
		const other = this.viewport.controlActor;

		this.otherSpacing  = this.distanceFrom(other);
		this.otherSpeed = other.args.gSpeed || other.args.xSpeed || other.gSpeedLast || other.xSpeedLast;
	}

	update(){}

	updateEnd()
	{
		if(!this.viewport || !this.viewport.controlActor)
		{
			return;
		}

		const other = this.viewport.controlActor;

		if(this.args.falling && other.args.fallTime < 15 && this.args.ySpeed < 0)
		{
			this.args.xSpeed = 0.995;
		}

		const viewport = this.viewport;

		if(this.args.falling)
		{
			this.viewport.onFrameOut(10, () => {
				if(this.args.falling)
				{
					viewport.auras.delete(this);
				}
			});
		}
		else
		{
			this.viewport.auras.add(this);
		}

		const speedMag  = Math.max(0, this.otherSpeed);
		const speedSign = Math.sign(this.args.gSpeed || this.gSpeedLast || other.args.gSpeed || other.args.xSpeed);

		const moving = this.args.gSpeed || this.args.xSpeed;

		if((moving || this.args.x < other.args.x - 160) && (!this.args.maxFollow || this.x < this.args.maxFollow))
		{
			const maxSpace = 64;
			const spacing  = this.otherSpacing;

			let gSpeed = speedMag * speedSign;

			if(spacing < maxSpace || (other.args.falling && other.args.ySpeed >= 0))
			{
				gSpeed *= 0.975;
			}

			if(gSpeed && this.args.groundAngle > 0)
			{
				gSpeed += 1.5 * Math.sign(gSpeed);
			}

			this.args.gSpeed = gSpeed;
		}

		super.update();
		super.updateEnd();
	}

	collideA(other)
	{
		if(!other.isHyper && !other.isSuper)
		{
			other.controllable && other.loseRings();
		}

		other.controllable && other.die();
	}

	get controllable() { return false; }
	get solid() { return false; }
}
