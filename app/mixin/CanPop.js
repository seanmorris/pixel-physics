import { Tag } from 'curvature/base/Tag';
import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

export const CanPop = {
	collideA: function(other, type) {

		if(other.knocked)
		{
			other.pop(other.knocked);
			this.pop(other.knocked);
			return;
		}

		if(other.punching)
		{
			this.args.falling = true;

			if(other.args.falling && other.args.ySpeed < 0)
			{
				// this.args.xSpeed = other.args.xSpeed + 10 * Math.sign(other.args.xSpeed);
				this.args.ySpeed = -10+other.args.ySpeed;
			}
			else
			{
				this.args.xSpeed = other.args.gSpeed * Math.sign(other.args.gSpeed) * 2;
				this.args.ySpeed = -2;
			}

			this.args.float = 15;
			this.knocked = other;
			this.noClip = true;
			this.static = false;

			this.viewport.onFrameOut(30, () => this.pop(other));

			return false;
		}

		if(!this.args.currentSheild
			&& !this.args.gone
			&& this.viewport
			&& (other.dashed || other.args.jumping || other.args.spinning || other instanceof Projectile)
		){
			this.pop(other);
			return;
		}

		if(!this.knocked && other && other.controllable && !other.punching)
		{
			if(typeof ga === 'function')
  			{
				ga('send', 'event', {
					eventCategory: 'badnik',
					eventAction: 'damaged-player',
					eventLabel: `${this.viewport.args.actName}::${this.args.id}::${other.args.id}`
				});
			}


			other.damage(this);
		}

		return false;
	}

	, damage: function(other, type) {
		this.pop(other);
	}

	, pop: function(other) {
		const viewport = this.viewport;

		if(!viewport || this.args.gone || (other && other.args.owner === this))
		{
			return;
		}

		const explosion = new Tag('<div class = "particle-explosion">');

		explosion.style({'--x': this.x, '--y': this.y-16});

		viewport.particles.add(explosion);

		setTimeout(() => viewport.particles.remove(explosion), 512);

		setTimeout(() => this.screen && this.screen.remove(), 1024);

		this.box && this.box.setAttribute('data-animation', 'broken');

		if(other && other.dashed)
		{
			other.args.gSpeed = 0;
			other.args.xSpeed = 0;
			other.args.ySpeed = -9;

			other.args.x = this.x;

			other.dashed = false;
		}

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

			if(other.controllable && typeof this.effect === 'function')
			{
				if(this.args.gold)
				{
					other.args.score += 10000;
				}
				else
				{
					other.args.score += 100;
				}

				this.effect(other);
			}

			if(other.dashed)
			{
				other.args.xSpeed /= 4;
			}

			const ySpeed = other.args.ySpeed;

			if(other.args.falling && !other.punching)
			{
				this.onNextFrame(() => {
					if(ySpeed > 0)
					{
						other.args.ySpeed = Math.min(-ySpeed, -7);
					}
					else
					{
						other.args.ySpeed += 4;
					}
					other.args.falling = true;
				});
			}

			other.dashed = false;
		}

		if(viewport.args.audio && this.sample)
		{
			this.sample.play();
		}

		if(this.args.target && this.viewport.actorsById[ this.args.target ])
		{
			const target = this.viewport.actorsById[ this.args.target ];

			if(target)
			{
				this.viewport.auras.add(target);

				target.activate(other, this);
			}
		}

		if(typeof ga === 'function')
		{
			ga('send', 'event', {
				eventCategory: 'badnik',
				eventAction: 'defeated',
				eventLabel: `${this.viewport.args.actName}::${this.args.id}`
			});
		}

		this.viewport.actors.remove(this);

		this.args.gone = true;

	}
}
