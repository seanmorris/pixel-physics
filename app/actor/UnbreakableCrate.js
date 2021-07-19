import { PointActor } from './PointActor';

import { Block } from './Block';

export class UnbreakableCrate extends Block
{
	constructor(...args)
	{
		super(...args);

		this.args.type   = 'actor-item actor-unbreakable-crate';
		this.args.width  = 64;
		this.args.height = 64;
		this.args.static = false;
	}

	collideA(other, type)
	{
		return true;
	}
}
