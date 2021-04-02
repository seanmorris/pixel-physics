import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class WaterRegion extends Region
{
	isWater = true;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-water';

		this.entryParticle = '<div class = "particle-splash">';

		this.args.gravity = 0.40;
		this.args.drag    = 0.85;
		this.args.density = 1;

		this.skimSpeed = 15;

		this.draining = 0;
	}

	update()
	{
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
					// this.draining = -1;
				}

				if(v)
				{
					this.draining = 1;
				}
				else
				{
					this.draining = -1;
				}
			});
		}

		if(!this.originalHeight)
		{
			this.originalHeight = this.public.height;
		}

		if(this.draining)
		{
			if(this.draining > 0 && this.public.height >= 32)
			{
				this.args.height -= 3.5;
			}
			else if(this.draining < 0 && this.public.height < this.originalHeight)
			{
				this.args.height += 3.5;
			}

			if(this.public.height <= 0)
			{
				this.args.display = 'none';

				if(this.draining > 0)
				{
					this.draining = 0;
				}
			}
			else
			{
				this.args.display = 'initial';
			}
		}

		if(this.target && this.args.height !== this.target)
		{
			const space      = this.args.height - this.target;
			const drainSpeed = this.args.drainSpeed ?? 1;
			const fillSpeed  = this.args.fillSpeed  ?? 1;

			const speed = space > 0 ? drainSpeed : fillSpeed;

			if(Math.abs(this.args.height - this.target) > speed)
			{
				this.args.height -= Math.abs(speed) * Math.sign(space);
			}
			else
			{
				this.args.height = this.target;
			}
		}

		super.update();
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
