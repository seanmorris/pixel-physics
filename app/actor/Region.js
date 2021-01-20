import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

export class Region extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-water';

		this.args.width  = this.public.width  || 32;
		this.args.height = this.public.height || 32;

		this.args.gravity = 0.25;
		this.args.drag    = 0.5;

		this.draining = 0;
	}

	onAttached()
	{
		this.box = this.findTag('div');

		this.altFilter = new Tag('<div class = "region-alt-filter">');

		this.box.appendChild(this.altFilter.node);
	}

	update()
	{
		if(!this.switch)
		{
			this.switch = this.viewport.actorsById[ this.public.switch ]

			this.switch.args.bindTo('active', v => {
				if(!v)
				{
					this.draining = -1;
				}

				if(v && this.draining < 0)
				{
					this.draining = 1;
				}
			});
		}

		if(!this.originalHeight)
		{
			this.originalHeight = this.public.height;
		}

		if(this.draining > 0 && this.public.height > 0)
		{
			this.args.height -= 6;
		}
		else if(this.draining < 0 && this.public.height < this.originalHeight)
		{
			this.args.height += 0.75;
		}

		const frame = this.viewport.args.frameId;

		this.args.height += Math.sin(frame / 10);

		super.update();
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
