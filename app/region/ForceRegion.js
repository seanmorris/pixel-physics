import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class ForceRegion extends Region
{
	isWater = true;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-force';

		this.args.xForce = 0;
		this.args.yForce = -5;
	}

	update()
	{
		if(!this.originalHeight)
		{
			this.originalHeight = this.public.height;
		}

		super.update();
	}

	updateActor(other)
	{
		if(Math.abs(other.public.xSpeed) < Math.abs(this.public.xForce))
		{
			other.args.xSpeed += Math.sign(other.public.xSpeed - -this.public.xForce);
		}

		if(Math.abs(other.public.ySpeed) < Math.abs(this.public.yForce))
		{
			other.args.ySpeed += Math.sign(other.public.ySpeed - -this.public.yForce);
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
