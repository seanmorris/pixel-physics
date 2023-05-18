import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class RollingRegion extends Region
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.sticky = true;

		this.args.type = 'region rolling';

		this.args.destroyTruck = this.args.destroyTruck ?? false;
		this.args.maxSpeed = this.args.maxSpeed ?? -1;
		this.args.minSpeed = this.args.minSpeed ?? -1;
		this.args.canJump  = this.args.canJump  ?? false;
		this.args.hidden   = true;
	}

	update()
	{
		if(!this.originalHeight)
		{
			this.originalHeight = this.args.height;
		}

		super.update();
	}

	updateActor(other)
	{
		if(!other.controllable)
		{
			return;
		}

		if(other.args.falling)
		{
			return;
		}

		other.willStick = false;

		const gSpeedLast = other.args.modeTime > 5 ? other.gSpeedLast : 0;

		if(Math.abs(other.args.gSpeed) < this.args.minSpeed)
		{
			other.args.gSpeed = this.args.minSpeed * Math.sign(other.args.gSpeed || gSpeedLast || other.args.direction);
		}

		if(this.args.maxSpeed > 0 && Math.abs(other.args.gSpeed) > this.args.maxSpeed)
		{
			other.args.gSpeed = this.args.maxSpeed * Math.sign(other.args.gSpeed || gSpeedLast || other.args.direction);

			if(other.args.mode === 1)
			{
				other.args.gSpeed = other.ySpeedLast;
			}

			if(other.args.mode === 3)
			{
				other.args.gSpeed = -other.ySpeedLast;
			}
		}

		if(!other.args.gSpeed)
		{
			other.args.gSpeed = 2 * Math.sign(gSpeedLast || other.args.direction);
		}

		if(!other.args.rolling)
		{
			other.args.rolling = true;
		}

		if(other.willJump)
		{
			if(!this.args.canJump)
			{
				other.willJump = false;
			}
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
