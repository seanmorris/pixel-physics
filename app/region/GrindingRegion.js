import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class GrindingRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region grinding';
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
		if(other.args.falling)
		{
			return;
		}

		other.args.grinding = true;
	}

	collideA(other, type)
	{
		super.collideA(other, type);
	}

	collideB(other, type)
	{
		super.collideA(other, type);
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
