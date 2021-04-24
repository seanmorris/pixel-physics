import { PointActor } from './PointActor';
import { Explosion }  from '../actor/Explosion';
import { Tag }        from 'curvature/base/Tag';

import { Region } from '../region/Region';
import { Spring } from './Spring';

export class Projectile extends PointActor
{
	float = -1;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-projectile';

		this.args.width  = 8;
		this.args.height = 8;

		this.removeTimer = null;
	}

	update()
	{
		if(this.removed)
		{
			return;
		}

		super.update();

		if(!this.args.xSpeed && !this.args.ySpeed)
		{
			this.explode();
		}

		if(!this.removeTimer)
		{
			this.removeTimer = this.onTimeout(500, () => this.explode());
		}
	}

	collideA(other)
	{
		if(other === this.args.owner || other instanceof Projectile || other instanceof Region || other instanceof Spring)
		{
			return false;
		}

		this.args.x += Math.cos(this.public.angle) * (other.args.width / 2) * Math.sign(this.public.xSpeed);
		this.args.y += Math.sin(this.public.angle) * (other.args.width / 2) * Math.sign(this.public.xSpeed);

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
		this.remove();
	}

	get canStick() { return false; }
	get solid() { return false; }
}
