import { PointActor } from './PointActor';
import { Explosion }  from '../actor/Explosion';
import { Tag }        from 'curvature/base/Tag';

import { Region } from '../region/Region';
import { Spring } from './Spring';
// import { StarPost } from './StarPost';

export class Projectile extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-projectile';

		this.args.width  = 8;
		this.args.height = 8;

		this.removeTimer = null;

		this.deflected = false;
	}

	update()
	{
		if(this.removed)
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

		if(!this.args.xSpeed && !this.args.ySpeed)
		{
			this.explode();
		}

		if(!this.removeTimer)
		{
			this.removeTimer = this.onTimeout(2500, () => this.explode());
		}
	}

	collideA(other)
	{
		if(other === this.args.owner || other instanceof Region || other instanceof Spring)
		{
			return false;
		}

		if(other.args.gone || this.deflected)
		{
			return false;
		}

		if(other.args.currentSheild && other.args.currentSheild.immune(other, this, 'projectile'))
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
			other.controllable && other.damage();
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

		setTimeout(() => viewport.particles.remove(particle), 350);

		this.viewport.actors.remove( this );
	}

	get canStick() { return false; }
	get solid() { return false; }
}
