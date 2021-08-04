import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';
import { BrokenMonitor } from '../actor/BrokenMonitor';

import { WoodenCrate } from '../actor/WoodenCrate';
import { SteelCrate } from '../actor/SteelCrate';

export class Monitor extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-monitor';

		this.args.width  = 30;
		this.args.height = 32;
		this.args.decel  = 5;

		this.args.gone = false;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.screen = new Tag(`<div class = "monitor-screen">`);

		this.sprite.appendChild(this.screen.node);
	}

	update()
	{
		super.update();

		if(!this.viewport)
		{
			return;
		}

		if(this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/object-destroyed.wav');
			this.sample.volume = 0.6 + (Math.random() * -0.3);
		}
	}

	collideA(other, type)
	{
		if(other instanceof WoodenCrate || other instanceof SteelCrate)
		{
			return false;
		}

		super.collideA(other, type);

		if(type === 2 && this.args.float && other.controllable)
		{
			other.args.ySpeed *= -1;
			this.args.ySpeed = -4;

			this.args.float = 0;

			this.ignores.set(other, 15);

			return true;
		}

		if(type !== 2
			&& ((other.args.ySpeed > 0 && other.y < this.y) || other.args.rolling)
			&& (!this.args.falling || this.args.float === -1)
			&& !this.args.gone
			&& this.viewport
		){
			this.pop(other);
			return;
		}

		if((type === 1 || type === 3)
			// && (Math.abs(other.args.xSpeed) > 15 || other instanceof Projectile)
			&& (other.args.rolling || other instanceof Projectile)
			&& !this.args.gone
			&& this.viewport
		){
			this.pop(other);
			return;
		}
	}

	pop(other)
	{
		const viewport = this.viewport;

		if(!viewport || this.args.gone)
		{
			return;
		}

		const explosion = new Tag('<div class = "particle-explosion">');

		if(other)
		{
			other.args.score += 100;
		}

		explosion.style({'--x': this.x, '--y': this.y-16});

		viewport.particles.add(explosion);

		setTimeout(() => viewport.particles.remove(explosion), 512);

		setTimeout(() => this.screen && this.screen.remove(), 1024);

		this.args.gone = true;

		this.box.setAttribute('data-animation', 'broken');

		if(other)
		{
			if(other.occupant)
			{
				other = other.occupant;
			}

			if(other.args.owner)
			{
				other = other.args.owner;
			}

			if(other.controllable)
			{
				this.effect(other);
			}
		}

		if(viewport.args.audio && this.sample)
		{
			this.sample.play();
		}

		if(other)
		{
			const ySpeed = other.args.ySpeed;

			if(other.args.falling)
			{
				this.onNextFrame(() => {
					other.args.ySpeed  = -ySpeed
					other.args.falling = true;
				});
			}

			if(this.args.falling && other.args.falling)
			{
				this.onNextFrame(() => other.args.xSpeed = -other.args.xSpeed);
			}
		}

		this.onTimeout(1500, () => { this.viewport.actors.remove(this); });
	}

	effect()
	{}

	get canStick() { return false; }
	get solid() { return false; }
}

