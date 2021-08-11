import { PointActor } from './PointActor';

import { Block } from './Block';

export class UnbreakableCrate extends Block
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type   = 'actor-item actor-unbreakable-crate';
		this.args.width  = 64;
		this.args.height = 64;
		this.args.static = false;
	}

	update()
	{
		if(this.viewport && this.args.gate)
		{
			const gatekeeper = this.viewport.actorsById[ this.args.gate ];

			if(!gatekeeper.args.hitPoints)
			{
				this.viewport.actors.remove(this);
			}
		}

		super.update();
	}

	collideA(other, type)
	{
		return true;
	}
}
