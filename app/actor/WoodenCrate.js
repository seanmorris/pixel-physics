import { BreakableBlock } from './BreakableBlock';
import { Platformer } from '../behavior/Platformer';
import { Projectile } from './Projectile';
import { Spring } from './Spring';
import { Block } from './Block';
import { Sfx } from '../audio/Sfx';
import { OrbSmall } from './OrbSmall';

export class WoodenCrate extends BreakableBlock
{
	constructor(...args)
	{
		super(...args);

		this.args.type   = 'actor-item actor-breakable-block actor-wooden-crate';
		this.args.width  = 64;
		this.args.height = 64;
		this.args.static = false;

		this[Spring.WontSpring] = true;
	}

	updateStart()
	{
		if(this.args.static)
		{
			this.args.static = !!this.bMap('checkBelow', this.x, this.y + 1).get(Platformer);
		}
		else
		{
			this.args.static = !this.args.falling;
		}

		if(this.args.gSpeed || this.args.xSpeed)
		{
			this.args.static = false;
		}

		super.updateStart();
	}

	update()
	{
		const wasFalling = this.args.falling;

		super.update();

		if(wasFalling && !this.args.falling && this.ySpeedLast > 9)
		{
			Sfx.play('WOOD_THUD');
		}
	}

	collideA(other, type)
	{
		if(other.args.ramming)
		{
			return false;
		}

		if(other instanceof Block)
		{
			return true;
		}

		if(type === 0 && other.controllable)
		{
			return true;
			// return super.collideA(other, type);
		}

		if(other instanceof OrbSmall && !this.broken)
		{
			this.break(other);
			return false;
		}

		if(other instanceof Projectile && !this.broken)
		{
			this.break(other);
			return true;
		}

		// if(other.spindashCharge)
		// {
		// 	this.break(other);
		// 	return true;
		// }

		// if(type === -1 && !other.args.gSpeed && !other.args.falling && other.controllable)
		// {
		// 	this.break(other);
		// 	return false;
		// }

		if(type !== 1 && type !== 3 || other.y <= this.y - this.args.height)
		{
			return true;
		}

		if(other.args.rolling || type === 2)
		{
			this.args.gSpeed = 0;
			this.args.xSpeed = 0;
			this.break(other);
			return false;
		}

		if(other.punching && !this.broken)
		{
			this.args.gSpeed = 0;
			this.args.xSpeed = 0;
			this.break(other);
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

	setTile()
	{
		this.args.spriteSheet = '/Sonic/wooden-crate.png';
	}
}
