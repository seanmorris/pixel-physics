import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

export class WaterfallRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-shade region-waterfall';
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

			this.tags.sprite.style({'--maskImage': `url(#mask-${this.args.id})`});
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
