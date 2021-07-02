import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { SkidDust } from '../behavior/SkidDust';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

export class CrabMeat extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-crabmeat';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 15;
		this.args.height    = 32;

		this.willStick = false;
		this.stayStuck = false;
	}

	update()
	{
		const direction = this.args.direction;

		if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
		{
			this.box.setAttribute('data-animation', 'skidding');
		}
		else if(this.args.moving && this.args.gSpeed)
		{
			this.box.setAttribute('data-animation', 'walking');
		}
		else
		{
			this.box.setAttribute('data-animation', 'standing');
		}

		super.update();
	}

	collideA(other, type)
	{
		console.log(type, other);
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
			this.pop(other)
			return;
		}

		return false;
	}

	pop(other)
	{
		const viewport = this.viewport;

		if(!viewport || this.args.gone)
		{
			return;
		}

		const explosion = new Tag('<div class = "particle-explosion">');

		explosion.style({'--x': this.x, '--y': this.y-16});

		viewport.particles.add(explosion);

		setTimeout(() => viewport.particles.remove(explosion), 512);

		setTimeout(() => this.screen && this.screen.remove(), 1024);

		this.box.setAttribute('data-animation', 'broken');

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

		if(viewport.args.audio && this.sample)
		{
			this.sample.play();
		}

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

		this.onTimeout(1500, () => {
			this.viewport.actors.remove(this);
			this.remove();
		});

		this.args.gone = true;
	}

	get solid() { return false; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
