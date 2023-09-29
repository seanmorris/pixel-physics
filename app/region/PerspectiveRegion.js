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

		this.args.xPerspective = 0;
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

		this.args.xPerspective = this.args.shift * i;

		this.viewport.args.xPerspective = this.viewport.args.xPerspective || 0;

		const diff = this.args.xPerspective - this.viewport.args.xPerspective;
		const step = 24;

		this.viewport.args.xPerspective += Math.sign(diff) * step;

		if(Math.abs(diff) < step)
		{
			this.viewport.args.xPerspective = this.args.xPerspective;
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
