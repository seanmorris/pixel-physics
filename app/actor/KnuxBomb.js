import { PointActor } from './PointActor';
import { Explosion }  from '../actor/Explosion';
import { Tag }        from 'curvature/base/Tag';

import { Region } from '../region/Region';
import { Spring } from './Spring';

export class KnuxBomb extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-knux-bomb';

		this.args.width  = 16;
		this.args.height = 16;

		this.removeTimer = null;
	}

	update()
	{
		if(this.removed)
		{
			return;
		}

		super.update();

		if(!this.args.xSpeed && !this.args.ySpeed && !this.args.gSpeed)
		{
			this.removeTimer = this.onTimeout(250, () => this.explode());
		}

		if(!this.removeTimer)
		{
			this.removeTimer = this.onTimeout(1500, () => this.explode());
		}
	}

	// collideA(other)
	// {
	// 	if(other === this.args.owner || other instanceof KnuxBomb || other instanceof Region || other instanceof Spring)
	// 	{
	// 		return false;
	// 	}

	// 	this.args.x += Math.cos(this.args.angle) * other.args.width / 2 * Math.sign(this.args.xSpeed);
	// 	this.args.y += Math.sin(this.args.angle) * other.args.width / 2 * Math.sign(this.args.xSpeed);

	// 	this.explode();

	// 	return false;
	// }

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
