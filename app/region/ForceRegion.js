import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class ForceRegion extends Region
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'region region-force';

		this.args.xForce = this.args.xForce || 0;
		this.args.yForce = this.args.yForce || -5;

		this.args.active = this.args.active ?? 1;
	}

	update()
	{
		if(!this.originalHeight)
		{
			this.originalHeight = this.args.height;
		}

		if(this.switch && this.switch.args.active > 0 && !this.args.active)
		{
			this.args.active = true;
		}

		super.update();
	}

	onAttach()
	{
		if(!this.viewport || !this.args.switch)
		{
			return;
		}
	}

	wakeUp()
	{
		this.switch = this.viewport.actorsById[ this.args.switch ];
	}

	activate()
	{
		this.args.active = 1;
	}

	updateActor(other)
	{
		if(other instanceof Region || other.args.static)
		{
			return;
		}

		if(this.args.active <= 0)
		{
			return;
		}

		if(other.args.falling)
		{
			other.args.xSpeed += Number(this.args.xForce);
			other.args.ySpeed += Number(this.args.yForce);
			// other.args.animation = 'springdash';
			other.args.groundAngle = 0;

			return;
		}

		switch(other.args.mode)
		{
			case 0:

				other.args.gSpeed += Math.sign(this.args.xForce);

				break;


			case 1:

				other.args.gSpeed += Math.sign(this.args.yForce);

				break;

			case 2:

				other.args.gSpeed -= Math.sign(this.args.xForce);

				break;


			case 3:

				other.args.gSpeed -= Math.sign(this.args.yForce);

				break;
		}

	}

	get solid() { return false; }
	get isEffect() { return true; }
}
