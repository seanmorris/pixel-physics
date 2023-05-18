import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class PerspectiveRegion extends Region
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
		this.args.perspective = true;
		this.args.shift = this.args.shift || 600;
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
		if(other !== this.viewport.controlActor)
		{
			return;
		}

		let i = (Math.abs(other.realAngle) + -Math.PI) / (Math.PI * 0.5);

		i = -1 + Math.abs(i);

		if(i < 0)
		{
			i++;
			i = 1 - i;
		}

		i = 1 - i;

		this.viewport.args.xPerspective = this.args.shift * i;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
