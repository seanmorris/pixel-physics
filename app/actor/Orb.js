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

		this.args.accel = 0.2;
		this.args.decel = 0;

		this.args.bindTo('x', (v,k,t,d,p) => this.args.rolled += 0.5 * Number(v - p || 0));

		this.args.gravity = 1.35;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--rolled'] = 'rolled';
	}

	update()
	{
		if(!this.viewport || !this.viewport.controlActor)
		{
			return;
		}

		if(this.args.falling)
		{
			this.viewport.onFrameOut(10, () => {
				if(this.args.falling)
				{
					this.viewport.auras.delete(this);
				}
			});
		}
		else
		{
			this.viewport.auras.add(this);
		}

		const other = this.viewport.controlActor;

		const speedMag = other.args.gSpeed// || Math.abs(other.x - other.xLast);

		const speedSign = Math.sign(this.args.gSpeed || this.gSpeedLast || other.args.gSpeed);

		const xSpace = this.x - other.x;

		if(xSpace < 0)
		{
			if(speedSign && this.args.mode === other.args.mode)
			{
				if(xSpace >= -96)
				{
					this.args.gSpeed = speedMag * speedSign * 0.75;
				}

				if(xSpace < -96)
				{
					this.args.gSpeed = speedMag * speedSign;
				}

				if(xSpace < -128 && !this.args.mode && !other.args.mode)
				{
					this.args.x -= xSpace + 128;
					this.args.gSpeed = speedMag * speedSign;
				}
			}
			else if(this.args.mode !== other.args.mode)
			{
				this.args.gSpeed = Math.max(
					speedMag * speedSign * 0.85
					, this.args.gSpeed * 0.95
				);
			}
		}

		super.update();
	}

	collideA(other)
	{
		other.controllable && other.loseRings();
		other.controllable && other.die();
	}

	get controllable() { return false; }
	get solid() { return false; }
}
