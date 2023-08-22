import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';

import { Flickie } from './Flickie';

import { PointActor } from './PointActor';

import { SkidDust } from '../behavior/SkidDust';
import { CanPop } from '../mixin/CanPop';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

export class Sparkle extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.args.type      = 'actor-item actor-sparkle';

		this.args.animation = 'standing';

		this.args.width     = 24;
		this.args.height    = 24;

		this.willStick = true;
		this.stayStuck = true;

		this.args.float  = -1;
		this.args.static = true;
		this.args.invincible = true;
		this.args.offset = this.args.offset ?? 0;
	}

	collideA(other, type)
	{
		if(other instanceof Projectile) return false;

		super.collideA(other, type);
	}
	update()
	{
		if(!this.viewport)
		{
			return;
		}

		const viewport = this.viewport;

		if(!this.lightning)
		{
			this.lightning = new Tag(`<div class = "particle-sparkle-lightning">`);

			viewport.particles.add(this.lightning);

			this.lightning.style({
				'--x': this.args.x
				, '--y': this.args.y + -64
			});
		}

		const frameId = viewport.args.frameId + -this.args.offset;

		if(frameId % 180 > 150)
		{
			this.args.animation = 'flicker-fast';
		}
		else if(frameId % 180 > 120)
		{
			this.args.animation = 'flicker';
		}
		else
		{
			this.args.animation = 'standing';
		}

		const direction = this.args.mode === 0 ? 1 : -1;
		const angle  = -Math.PI/2 * direction;

		if(frameId % 180 > 168)
		{
			const length = this.castRayQuick(2048, angle);

			this.args.invincible = true;

			this.lightning.style({height: `${length - this.args.height}px`});

			const toX = this.args.x + Math.round(Math.cos(angle) * (length + -1));
			const toY = this.args.y + Math.round(Math.sin(angle) * (length + -1));

			const blocking = viewport.actorsAtLine(this.args.x, this.args.y, toX, toY);

			blocking.delete(this);

			for(const [b,p] of blocking)
			{
				if(!b.controllable)
				{
					continue;
				}

				b.damage(this, 'electric');

				b.pop && b.pop(this);
			}
		}
		else
		{
			this.lightning.style({height:'0px'});
			this.args.invincible = false;
		}

		if(frameId % 180 === 0)
		{
			const length = this.castRayQuick(2048, angle);

			this.lightning.style({
				'--x': this.args.x
				, '--y': this.args.y + -length*0.5 + (this.args.mode === 2 ? length : 0) + (direction * this.args.height * 0.5)
			});

			const toX = this.args.x + Math.round(Math.cos(angle) * (length + -1));
			const toY = this.args.y + Math.round(Math.sin(angle) * (length + -1));

			this.args.x = toX;
			this.args.y = toY;

			this.args.facing = direction > 0 ? 'right' : 'left';

			this.args.mode = this.args.mode === 0 ? 2 : 0;

			if(this.vizi)
			{
				const speed = 0.25;

				const sparkL = new Projectile({
					owner: this
					, subType:'spark'
					, damageType: 'electric'
					, gravity: 0
					, ySpeed: speed * direction
					, xSpeed: -speed
					, x:this.args.x
					, y:this.args.y
				});

				const sparkR = new Projectile({
					owner: this
					, subType:'spark'
					, damageType: 'electric'
					, gravity: 0
					, ySpeed: speed * direction
					, xSpeed: speed
					, x:this.args.x
					, y:this.args.y
				});

				viewport.spawn.add({object:sparkL});
				viewport.spawn.add({object:sparkR});
			}
		}

		super.update();
	}

	effect(other)
	{
		super.effect(other);
	}

	pop(other)
	{
		const viewport = this.viewport;

		super.pop(other);

		if(this.args.gone)
		{
			viewport.particles.remove(this.lightning);
		}
	}

	get solid() { return false; }
	get isEffect() { return false; }
	// get controllable() { return true; }
}
