import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';
import { Projectile } from '../actor/Projectile';
import { Block } from './Block';

export class Blastoid extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		// this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-blastoid';

		this.args.animation = 'standing';

		// this.args.accel     = 0.75;
		// this.args.decel     = 0.5;

		// this.args.gSpeedMax = 15;
		// this.args.jumpForce = 5;
		// this.args.gravity   = 0.5;

		this.args.width   = 35;
		this.args.height  = 21;
		this.args.flipped = false;
		this.args.careening = false;
		this.args.color = this.args.color ?? 'blue';

		this.willStick = true;
		this.stayStuck = true;

		this.args.bounceCount = 0;

		// this.args.patrolPause   = this.args.patrolPause   ?? 20;
		this.args.patrolBeat = this.args.patrolBeat    ?? 120;
		// this.args.patrolSpeed   = this.args.patrolSpeed   ?? 4;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoAttr.get(this.box)['data-color']   = 'color';
		this.autoAttr.get(this.box)['data-flipped'] = 'flipped';
	}

	update()
	{
		if(this.args.flipped)
		{
			super.update();
			this.args.pushing = false;

			const xMoved = this.args.x - this.xLast;
			const yMoved = this.args.y - this.yLast;

			this.args.facing = this.args.gSpeed > 0 ? 'left' : 'right';

			if(this.getMapSolidAt(this.args.x + 2 + this.args.width / 2, this.args.y - 8))
			{
				this.args.gSpeed = -12;
				this.args.xSpeed = -12;
				this.args.bounceCount++;
			}
			else if(this.getMapSolidAt(this.args.x + -2 + -this.args.width / 2, this.args.y - 8))
			{
				this.args.gSpeed = 12;
				this.args.xSpeed = 12;
				this.args.bounceCount++;
			}

			if(this.args.bounceCount > 5)
			{
				super.pop();
			}

			return;
		}

		// const direction = this.args.direction;
		const telegraph = this.args.shotTelegraph;
		const beat      = this.args.patrolBeat;

		const frameId = this.viewport.args.frameId - 30;

		if(this.viewport.actorIsOnScreen(this,0) && frameId % beat === 0)
		{
			const xSpeed = +2.5;
			const ySpeed = -3;

			const owner = this;

			const ball = new Projectile({
				x:this.x + 13 * this.args.direction
				, y:this.y + -8
				, xSpeed: xSpeed * this.args.direction
				, ySpeed
				, owner
			});

			this.viewport.spawn.add({object:ball});
		}

		super.update();

		// this.args.direction = Math.sign(this.args.gSpeed);
	}

	effect(other)
	{
		super.effect(other);

		// this.viewport.spawn.add({object:new Flickie({
		// 	x: this.args.x,
		// 	y: this.args.y,
		// })});
	}

	collideA(other, type)
	{
		if(this.args.careening)
		{
			if(typeof other.pop === 'function')
			{
				other.pop(this);
				super.pop(other);
			}

			if(typeof other.break === 'function')
			{
				if(!other.broken)
				{
					super.pop(other);
				}

				if(!other.args.strength || other.args.strength < 2)
				{
					other.break(this);
				}
			}
		}

		if(other.controllable)
		{
			if(other.args.careening || (this.args.flipped && other.args.falling && other.args.ySpeed > 4))
			{
				other.args.ySpeed *= -1;
				this.args.gSpeed = 12 * Math.sign(this.args.x - other.args.x);
				this.args.careening = true;
				this.args.decel = 0;
			}
		}

		return super.collideA(other, type);
	}

	pop(other)
	{
		// if(other instanceof Blastoid)
		// {
		// 	return super.pop(other);
		// }

		if(!this.args.flipped)
		{
			if(other)
			{
				if(other.args.rolling)
				{
					other.args.ySpeed *= -1;
					this.args.gSpeed = 12 * Math.sign(other.args.gSpeed);
					this.args.careening = true;
					this.args.decel = 0;
					other.args.gSpeed = 0;
				}
				else
				{
					this.args.flipped = true;
					this.args.falling = true;
					this.args.ySpeed = -9;
					this.args.y--;
					this.ignores.set(other, 10);
					other.args.ySpeed *= -1;
				}
			}

			return;
		}

		// return super.pop(other);
	}

	get solid() { return false; }
	get isEffect() { return false; }
	// get controllable() { return true; }
}
