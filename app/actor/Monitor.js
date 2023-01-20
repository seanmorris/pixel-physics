import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';
import { BrokenMonitor } from '../actor/BrokenMonitor';

import { Block } from '../actor/Block';

import { Marker } from '../actor/Marker';

import { Sfx } from '../audio/Sfx';

export class Monitor extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-monitor';

		this.args.width    = 30;
		this.args.height   = 32;
		this.args.decel    = 0.25;
		this.args.canHide  = true;
		this.args.platform = true;

		this.args.gone = false;
	}

	onRendered(event)
	{
		super.onRendered(event);

		if(!this.screen && this.sprite)
		{
			this.screen = new Tag(`<div class = "monitor-screen">`);

			this.sprite.appendChild(this.screen.node);
		}
	}

	update()
	{
		super.update();

		if(!this.viewport)
		{
			return;
		}
	}

	collideA(other, type)
	{
		if(other.args.static)
		{
			return true;
		}

		if(!other.args.moving && !other.args.falling)
		{
			return false;
		}

		if(other instanceof Block)
		{
			return false;
		}

		if(other instanceof Marker)
		{
			other = other.owner;
		}

		super.collideA(other, type);

		if(other.passPop && other.occupant&& !other.args.dead)
		{
			other = other.occupant;
			this.pop(other);
			return;
		}
		
		// if(type === 1 && !other.args.spinning)
		// {
		// 	return true;
		// }

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
			&& other.args.spinning
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
			return false;
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
			const reward = {label: this.name || this.args.name, points:10, multiplier:1};

			other.args.popChain.push(reward);
			other.args.popCombo += 1;
		}

		explosion.style({'--x': this.x, '--y': this.y-16});

		const scoreNode = document.createElement('div');
		scoreNode.classList.add('particle-score');
		scoreNode.classList.add('score-10');
		const scoreTag = new Tag(scoreNode);

		scoreTag.style({'--x': this.args.x, '--y': this.args.y-16});

		viewport.particles.add(scoreTag);

		viewport.particles.add(explosion);

		setTimeout(() => viewport.particles.remove(explosion), 512);
		setTimeout(() => viewport.particles.remove(scoreTag), 768);

		setTimeout(() => this.screen && this.screen.remove(), 1024);

		this.args.gone = true;

		this.box && this.box.setAttribute('data-animation', 'broken');

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

		Sfx.play('OBJECT_DESTROYED');

		if(typeof ga === 'function')
		{
			ga('send', 'event', {
				eventCategory: 'monitor',
				eventAction: 'popped',
				eventLabel: `${this.viewport.args.actName}::${this.args.id}`
			});
		}

		if(other)
		{
			const ySpeed = other.args.ySpeed;

			if(other && other.dashed)
			{
				other.args.gSpeed = 0;
				other.args.xSpeed = -1.5 * Math.sign(other.args.xSpeed);
				other.args.ySpeed = -10;

				other.dashed = false;
			}
			else if(other && other.args.falling)
			{
				this.onNextFrame(() => {
					other.args.ySpeed  = -ySpeed
					other.args.falling = true;
				});
			}

			if(this.args.falling && other.args.falling)
			{
				// this.onNextFrame(() => other.args.xSpeed = -other.args.xSpeed);
			}
		}

		// this.onTimeout(1500, () => { this.viewport.actors.remove(this); });

		if(other && this.viewport.settings.rumble && other.controller && other.controller.rumble)
		{
			other.controller.rumble({
				duration: 40,
				strongMagnitude: 0.0,
				weakMagnitude: 1.0
			});

			this.viewport.onTimeout(40, () => {
				other.controller.rumble({
					duration: 110,
					strongMagnitude: 0.75,
					weakMagnitude: 1.0
				});
			});
		}
	}

	effect()
	{}

	get canStick() { return false; }
	get solid() { return false; }
}

