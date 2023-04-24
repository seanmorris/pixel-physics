import { PointActor } from './PointActor';
import { Platformer } from '../behavior/Platformer';

import { Marker }     from '../actor/Marker';
import { Explosion }  from '../actor/Explosion';
import { Tag }        from 'curvature/base/Tag';

import { Region } from '../region/Region';
import { Spring } from './Spring';
import { BreakableBlock } from './BreakableBlock';
import { Block } from './Block';

// import { StarPost } from './StarPost';

export class Projectile extends PointActor
{
	constructor(args = {}, parent)
	{
		const gravity = args.gravity;

		super(args, parent);

		this.args.type = 'actor-item actor-projectile';

		if(this.args.subType)
		{
			this.args.type = this.args.type + ' ' + this.args.subType;
		}

		this.args.damageType = this.args.damageType ?? 'normal';

		this.behaviors.add(new Platformer);

		this.args.width  = 8;
		this.args.height = 8;

		this.args.strength = this.args.strength || 1;

		this.args.gravity = gravity ?? 0.15;

		this.removeTimer = null;
		this.noClip = true;

		this.deflected = false;
	}

	update()
	{
		if(this.removed || !this.viewport)
		{
			return;
		}

		if(!this.args.falling)
		{
			this.args.gSpeed = 0;
			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
		}

		super.update();

		if(!this.args.xSpeed && !this.args.ySpeed && this.age > 1)
		{
			this.explode();
		}

		if(this.viewport && !this.removeTimer)
		{
			this.removeTimer = this.viewport.onFrameOut(200, () => this.explode());
		}
	}

	collideA(other)
	{
		if(other instanceof Projectile)
		{
			return;
		}

		if(other === this.args.owner || other instanceof Region || other instanceof Spring)
		{
			return false;
		}

		if(!(other instanceof Marker) && !this.args.owner.controllable && !other.controllable)
		{
			return;
		}

		if(this.args.strength <= 1 && other instanceof BreakableBlock)
		{
			return false;
		}

		if(other.args.gone || this.deflected)
		{
			return false;
		}

		if(other instanceof Marker || (other.args.currentSheild && other.args.currentSheild.immune(other, this, 'projectile')))
		{
			this.args.xSpeed *= -1;
			this.args.ySpeed *= -1;

			this.deflected = true;

			return;
		}

		if(!other.solid && !other.controllable)
		{
			return false;
		}

		this.args.xSpeed = 0;
		this.args.ySpeed = 0;
		this.args.float  = -1;

		if(this.args.owner && !this.args.owner.args.gone)
		{
			(other.controllable || (other instanceof BreakableBlock)) && other.damage(this, this.args.damageType);
		}

		// this.args.x += Math.cos(this.args.angle) * (other.args.width / 2) * Math.sign(this.args.xSpeed);
		// this.args.y += Math.sin(this.args.angle) * (other.args.width / 2) * Math.sign(this.args.xSpeed);

		this.explode();

		return false;
	}

	explode()
	{
		const viewport  = this.viewport;

		if(!viewport)
		{
			return;
		}

		const particle = new Tag('<div class = "particle-explosion">');

		particle.style({'--x': this.x, '--y': this.y});

		viewport.particles.add(particle);

		this.viewport.onFrameOut(20, () => viewport.particles.remove(particle));

		this.viewport.actors.remove( this );
		this.remove();
	}

	get canStick() { return false; }
	get solid() { return false; }
}
