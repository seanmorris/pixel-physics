import { Tag } from 'curvature/base/Tag';
import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';
import { Sfx } from '../audio/Sfx';
import { Analytic } from '../lib/Analytic';
import { Vehicle } from '../actor/Vehicle';

export class CanPop
{
	collideA(other, type)
	{
		if(this.knocked && other.pop)
		{
			this.pop(this.knocked);
		}

		const viewport = this.viewport;

		if(this.args.invincible)
		{
			other.damage(this);
			return;
		}

		if(other.knocked)
		{
			other.pop && other.pop(other.knocked);
			this.pop(other.knocked);
			return;
		}

		if(other.punching && !this.knocked)
		{
			// this.viewport.args.frozen = 1;

			this.args.falling = true;

			if(Math.abs(other.args.gSpeed || other.gSpeedLast) < 5)
			{
				this.pop(other);
				return;
			}

			if(other.args.falling && other.args.ySpeed < 0)
			{
				// this.args.xSpeed = other.args.xSpeed + 10 * Math.sign(other.args.xSpeed);
				this.args.ySpeed = -10+other.args.ySpeed;
				this.args.y -= 18;
			}
			else
			{
				this.args.xSpeed = 1.2 * (other.args.gSpeed || other.gSpeedLast);
				this.args.ySpeed = -5;
				this.args.y -= 18;
			}

			this.args.x = other.args.x + 24 * other.args.direction + other.args.gSpeed;

			// this.args.float = 15;
			this.knocked = other;
			// this.noClip = true;
			this.static = false;

			this.viewport.onFrameOut(60, () => this.pop(other));

			return false;
		}

		const shield = this.args.currentSheild;
		const immune = other.immune(this, shield ? shield.type : 'normal');

		if((!shield || immune)
			&& !this.args.gone
			&& this.viewport
			&& (immune || other.dashed || other.args.jumping || other.args.bellySliding || other.args.spinning || (other.args.standinOn && other.args.standinOn instanceof Vehicle) || (other instanceof Projectile && other.args.owner && other.args.owner.controllable))
		){
			const otherShield = other.args.currentSheild;
			this.damage(other, otherShield ? otherShield.type : (other.args.damageType || 'normal'));
			return;
		}

		if(!this.knocked && other && other.controllable && !other.punching)
		{
			if(viewport && typeof ga === 'function')
  			{
				Analytic.report({
					eventCategory: 'badnik',
					eventAction: 'damaged-player',
					eventLabel: `${viewport.args.actName}::${this.args.name}::${this.args.id}::${other.args.id}`
				});
			}

			if(!other.args.mercy)
			{
				other.damage(this, shield ? shield.type : 'normal');
				this.ignores.set(other, 10);
			}
		}

		return false;
	}

	damage(other, type)
	{
		if(this.args.invincible)
		{
			return;
		}

		if(!other)
		{
			this.pop();
			return;
		}

		const shield = this.args.currentSheild;
		const immune = other.immune(this, shield ? shield.type : 'normal');

		if((!shield || immune)
			&& !this.args.gone
			&& this.viewport
			&& (immune || other.dashed || other.args.jumping  || other.args.bellySliding || other.args.spinning || other instanceof Projectile)
		){
			this.pop(other);
		}
	}

	pop(other)
	{
		const viewport = this.viewport;

		if(!viewport || this.args.gone || this.args.invincible || (other && other.args.owner === this))
		{
			return;
		}

		this.args.gone = true;

		const explosionTag = document.createElement('div');
		explosionTag.classList.add('particle-explosion');
		const explosion = new Tag(explosionTag);

		explosion.style({'--x': this.args.x, '--y': this.args.y-16});

		viewport.particles.add(explosion);

		viewport.onFrameOut(30, () => viewport.particles.remove(explosion));
		viewport.onFrameOut(90, () => this.screen && this.screen.remove());

		this.box && this.box.setAttribute('data-animation', 'broken');

		if(other && other.dashed)
		{
			if(Math.abs(other.args.xSpeed) >Math.abs(other.args.ySpeed))
			{
				other.args.gSpeed = 0;
				other.args.xSpeed = -1.5 * Math.sign(other.args.xSpeed);
				other.args.ySpeed = -10;
			}

			other.dashed = false;
		}

		if(other)
		{
			if(other.args.doubleSpin)
			{
				other.args.doubleSpin = 2;
			}

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
				let points = 100;

				if(this.args.gold)
				{
					points = 10000;
				}

				const reward = {label: this.name || this.args.name, points, multiplier:1};

				if(this.args.gold)
				{
					reward.label   = 'Gold ' + reward.label;
					reward.color   = 'orange';
					reward.special = true;
				}

				if(!other.isVehicle && other.args.ySpeed > 5 && other.args.ySpeed < 25 && Math.abs(other.args.ySpeed) > Math.abs(other.args.xSpeed))
				{
					other.args.cameraMode = 'popping';
				}

				other.args.popCombo += 1;
				other.args.popChain.push(reward);

				if(other.args.ySpeed > 25 && !other.args.bouncing)
				{
					const reward = {label: 'BIG AIR!!!', points:1000, multiplier: 2};

					other.args.popChain.push(reward);
					other.args.popCombo += 1;

					if(!other.airReward && Math.abs(other.args.xSpeed) > 10)
					{
						other.args.x = this.args.x;
						other.args.y = this.args.y + -8;

						viewport.onFrameOut(1, () => viewport.args.frozen = 25);

						viewport.args.invert = 'invert';
						viewport.onFrameOut(25, () => viewport.args.invert = '');

						Sfx.play('SICK_TRICK');
						Sfx.play('SICK_TRICK');
					}

					other.airReward = reward;
				}

				const scoreNode = document.createElement('div');
				scoreNode.classList.add('particle-score');
				const scoreTag = new Tag(scoreNode);

				scoreTag.style({'--x': this.args.x, '--y': this.args.y-16});

				switch(true)
				{
					case this.args.gold:
						// scoreNode.classList.add('score-10000');
						points = 10000;
						break;
					case other.args.popCombo === 1:
						// scoreNode.classList.add('score-100');
						points = 100;
						break;
					case other.args.popCombo === 2:
						// scoreNode.classList.add('score-200');
						points = 200;
						break;
					case other.args.popCombo === 3:
						// scoreNode.classList.add('score-300');
						points = 300;
						break;
					case other.args.popCombo === 4:
						// scoreNode.classList.add('score-400');
						points = 400;
						break;
					case other.args.popCombo === 5:
						// scoreNode.classList.add('score-500');
						points = 500;
						break;
					case other.args.popCombo === 6:
						// scoreNode.classList.add('score-600');
						points = 600;
						break;
					case other.args.popCombo === 7:
						// scoreNode.classList.add('score-700');
						points = 700;
						break;
					case other.args.popCombo === 8:
						// scoreNode.classList.add('score-800');
						points = 800;
						break;
					case other.args.popCombo === 9:
						// scoreNode.classList.add('score-900');
						points = 900;
						break;
					case other.args.popCombo >= 10:
						// scoreNode.classList.add('score-1000');
						points = 1000;
						break;
				}

				// viewport.particles.add(scoreTag);

				// viewport.onFrameOut(80, () => viewport.particles.remove(scoreTag));

				// other.args.score += points;

				this.effect(other);
			}

			const ySpeed = Math.min(other.args.ySpeed, other.ySpeedLast);

			if(other.args.falling && !other.punching)
			{
				const spinning = other.args.spinning;
				const jumping  = other.args.jumping;
				const flying   = other.args.flying;
				const xSpeed   = other.args.xSpeed || other.args.gSpeed;

				viewport.onFrameOut(1,() => {

					if(ySpeed >= 0)
					{
						if(other.flyTime < 5)
						{
							other.args.ySpeed = Math.min(-ySpeed, -7);
						}
						else
						{
							other.args.ySpeed = Math.min(-ySpeed, -2);
						}
					}
					else
					{
						other.args.ySpeed += 8;
					}

					other.args.spinning = other.args.spinning || spinning;
					other.args.jumping  = other.args.jumping  || jumping;
					other.args.flying   = other.args.flying   || flying;
					other.args.xSpeed   = xSpeed;

					other.args.falling = true;
				});
			}

			other.dashed = false;

			if(this.viewport.settings.rumble)
			{
				if(other && other.controller && other.controller.rumble)
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

		Sfx.play('OBJECT_DESTROYED');

		if(typeof ga === 'function')
		{
			Analytic.report({
				eventCategory: 'badnik',
				eventAction: 'defeated',
				eventLabel: `${viewport.args.actName}::${this.args.name}::${this.args.id}`
			});
		}

		this.viewport.actors.remove(this);
	}
}
