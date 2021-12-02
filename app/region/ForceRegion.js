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
			this.originalHeight = this.public.height;
		}

		super.update();
	}

	onAttach()
	{
		if(!this.viewport || !this.args.switch)
		{
			return;
		}

		this.switch = this.viewport.actorsById[ this.args.switch ];

		if(!this.switch)
		{
			return;
		}

		this.switch.args.bindTo('active', v => {
			this.args.active = v || this.args.active;
		});
	}

	activate()
	{
		this.args.active = 1;
	}

	updateActor(other)
	{
		if(other.args.static)
		{
			return;
		}

		if(this.args.active <= 0)
		{
			return;
		}

		if(other.args.falling)
		{
			this.onNextFrame(()=>{
				other.args.xSpeed += Math.sign(this.public.xForce);
				other.args.ySpeed += Math.sign(this.public.yForce);
				other.args.animation = 'springdash';
				other.args.groundAngle = 0;
			});

			return;
		}

		switch(other.args.mode)
		{
			case 0:

				other.args.gSpeed += Math.sign(this.public.xForce);

				break;


			case 1:

				other.args.gSpeed += Math.sign(this.public.yForce);

				break;

			case 2:

				other.args.gSpeed -= Math.sign(this.public.xForce);

				break;


			case 3:

				other.args.gSpeed -= Math.sign(this.public.yForce);

				break;
		}

	}

	get solid() { return false; }
	get isEffect() { return true; }
}
