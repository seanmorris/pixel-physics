import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';
import { Projectile } from '../actor/Projectile';

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

			const xMoved = this.args.x - this.xLast;
			const yMoved = this.args.y - this.yLast;

			if(this.args.careening && !xMoved && !yMoved && !this.args.falling)
			{
				super.pop();
				return;
			}

			return;
		}

		// const direction = this.args.direction;
		const telegraph = this.args.shotTelegraph;
		const beat      = this.args.patrolBeat;

		if(this.viewport.args.frameId % beat === 0)
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

	// collideA(other, type)
	// {
	// 	if(typeof other.pop === 'function')
	// 	{
	// 		other.pop(other, type);
	// 	}

	// 	if(this.args.careening && other.controllable)
	// 	{
	// 		super.pop(other);
	// 		return;
	// 	}

	// 	if(this.args.flipped)
	// 	{
	// 		other.args.ySpeed *= -1;
	// 		this.args.gSpeed = 12 * Math.sign(this.args.x - other.args.x);
	// 		this.args.careening = true;
	// 		this.args.decel = 0;
	// 		return;
	// 	}

	// 	return super.collideA(other, type);
	// }

	// pop(other)
	// {
	// 	if(!this.args.flipped)
	// 	{
	// 		this.args.flipped = true;
	// 		this.args.falling = true;
	// 		this.args.ySpeed = -6;
	// 		this.args.y--;

	// 		if(other)
	// 		{
	// 			this.ignores.set(other, 10);
	// 			other.args.ySpeed *= -1;
	// 		}

	// 		return;
	// 	}

	// 	// return super.pop(other);
	// }

	get solid() { return false; }
	get isEffect() { return false; }
	// get controllable() { return true; }
}
