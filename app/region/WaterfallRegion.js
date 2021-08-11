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

	get solid() { return false; }
	get isEffect() { return true; }
}
