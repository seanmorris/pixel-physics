import { BreakableBlock } from './BreakableBlock';
import { Projectile } from './Projectile';

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
			return true;
			// return super.collideA(other, type);
		}

		if(other instanceof Projectile && !this.broken)
		{
			this.break();
			return true;
		}

		if(other.spindashCharge)
		{
			this.break();
			return true;
		}

		if(type === -1 && !other.args.gSpeed && !other.args.falling && other.controllable)
		{
			this.break();
			return false;
		}

		if(type !== 1 && type !== 3 || other.y <= this.y - this.args.height)
		{
			return true;
		}

		if(other.args.rolling || type === 2)
		{
			this.break();
			return false;
		}

		if(other.punching && !this.broken)
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
