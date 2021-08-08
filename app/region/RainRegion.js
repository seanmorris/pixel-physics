import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

export class RainRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-shade region-rain';
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
