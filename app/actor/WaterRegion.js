import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class WaterRegion extends Region
{
	isWater = true;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-water';

		this.args.gravity = 0.25;
		this.args.drag    = 0.85;

		this.draining = 0;
	}

	update()
	{
		super.update();

		if(!this.filterWrapper && this.tags.sprite)
		{
			this.filterWrapper = new Tag('<div class = "region-filter-wrapper">');
			this.colorWrapper  = new Tag('<div class = "region-color-wrapper">');

			this.filter = new Tag('<div class = "region-filter">');
			this.color  = new Tag('<div class = "region-color">');

			this.filterWrapper.appendChild(this.filter.node);
			this.colorWrapper.appendChild(this.color.node);

			this.tags.sprite.appendChild(this.filterWrapper.node);
			this.tags.sprite.appendChild(this.colorWrapper.node);
		}

		if(!this.switch && this.public.switch)
		{
			this.switch = this.viewport.actorsById[ this.public.switch ]

			this.switch.args.bindTo('active', v => {
				if(!v && this.draining > 0)
				{
					this.draining = -1;
				}

				if(v)
				{
					this.draining = 1;
				}
			});
		}

		if(!this.originalHeight)
		{
			this.originalHeight = this.public.height;
		}

		if(this.draining)
		{
			if(this.public.height <= 0)
			{
				this.args.display = 'none';
			}
			else
			{
				this.args.display = 'initial';
			}

			if(this.draining > 0 && this.public.height > 0)
			{
				this.args.height -= 3;
			}
			else if(this.draining < 0 && this.public.height < this.originalHeight)
			{
				this.args.height += 0.5;
			}
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}