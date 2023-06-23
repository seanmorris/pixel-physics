import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class SlidingRegion extends Region
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.sticky = true;
		this.args.hidden = true;
		this.args.canJump = this.args.canJump ?? true;

		this.args.type = 'region sliding';

		this.args.toSpeed = this.args.toSpeed ?? 8;
	}

	updateActor(other)
	{
		if(other.args.static)
		{
			return;
		}

		if(other.args.falling)
		{
			return;
		}

		if(!other.controllable)
		{
			return;
		}

		other.willStick = false;

		if(Math.abs(this.args.toSpeed - other.args.gSpeed) > 1)
		{
			other.args.gSpeed += Math.sign(this.args.toSpeed - other.args.gSpeed);
		}
		else
		{
			other.args.gSpeed = this.args.toSpeed;
		}

		other.args.rolling = false;
		other.args.sliding = true;

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
