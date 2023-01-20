import { Block } from './Block';
import { BreakableBlock } from './BreakableBlock';
import { Projectile } from './Projectile';

export class SteelCrate extends BreakableBlock
{
	constructor(...args)
	{
		super(...args);

		this.args.type   = 'actor-item actor-breakable-block actor-steel-crate';
		this.args.width  = 64;
		this.args.height = 64;
		this.args.static = this.args.static ?? false;
	}

	collideA(other, type)
	{
		if(other instanceof Block)
		{
			return true;
		}

		if(other instanceof Projectile && !this.broken)
		{
			this.break();
			return true;
		}

		if(other.args.bouncing && !this.broken)
		{
			this.break();
			return true;
		}

		if(other.punching && !this.broken)
		{
			this.break();
			return false;
		}

		if(other.args.rolling && !this.broken)
		{
			return true;
		}

		if(type === 0 && other.controllable)
		{
			return true;
		}

		if(type !== 1 && type !== 3 || other.y <= this.y - this.args.height)
		{
			return true;
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

	setTile()
	{
		this.args.spriteSheet = '/custom/steel-crate.png';
	}
}
