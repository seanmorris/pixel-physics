import { PointActor } from './PointActor';

import { BreakableBlock } from './BreakableBlock';

export class WoodenCrate extends BreakableBlock
{
	constructor(...args)
	{
		super(...args);

		this.args.type   = 'actor-item actor-breakable-block actor-wooden-crate';
		this.args.width  = 60;
		this.args.height = 60;
		this.args.static = false;
	}

	collideA(other, type)
	{
		if(type === 0 && other.controllable)
		{
			return super.collideA(other, type);
		}

		if(type !== 1 && type !== 3 || other.y <= this.y - this.args.height)
		{
			return true;
		}

		if(other.args.rolling)
		{
			this.break();
			return false;
		}

		if(!this.viewport)
		{
			return false;
		}

		if(type === -1 || other.args.rolling)
		{
			return super.collideA(other, type);
		}

		return true;
	}
}
