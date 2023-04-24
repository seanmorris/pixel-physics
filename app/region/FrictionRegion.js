import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class FrictionRegion extends Region
{
	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.type     = 'region region-friction';
		this.args.friction = args.friction ?? 1;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
