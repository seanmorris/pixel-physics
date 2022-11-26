import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

import { ObjectPalette } from '../ObjectPalette';

export class Meanie extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-meanie';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 16;
		this.args.height    = 29;

		this.willStick = false;
		this.stayStuck = false;

		this.args.patrolPause = this.args.patrolPause   ?? 40;
		this.args.patrolBeat  = this.args.patrolBeat    ?? 140;
		this.args.patrolSpeed = this.args.patrolSpeed   ?? 1;

		this.age = 0;

		// this.args.hatType = this.args.hatType ?? 'skull';
		this.args.hatType = this.args.hatType ?? 'pumpkin';
	}

	wakeUp(event)
	{
		if(!this.viewport)
		{
			return;
		}

		if(!this.hat && ObjectPalette[this.args.hatType])
		{
			this.hat = new ObjectPalette[this.args.hatType];

			this.viewport.spawn.add({object:this.hat});

			this.hat.args.float = -1;
			this.hat.noClip = true;

			this.hat.args.x = this.args.x;
			this.hat.args.y = this.args.y + 14;

			this.viewport.setColCell(this.hat);

			if(this.args.hatType)
			{
				this.hat.args.face = true;
			}
		}
	}

	update()
	{
		const direction = this.args.direction;

		const telegraph = this.args.shotTelegraph;
		const beat      = this.args.patrolBeat;

		if(this.box)
		{
			if(this.args.moving && this.args.gSpeed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}

		super.update();

		this.args.groundAngle = 0;

		this.args.direction = Math.sign(this.args.xSpeed || this.args.gSpeed);

		this.age++;

		if(!this.args.falling && !this.jumpTimer)
		{
			this.jumpTimer = this.onNextFrame(() => {
				this.args.ySpeed = Math.max(-this.ySpeedLast, -12) || -6;
				this.args.xSpeed = this.args.gSpeed;
				this.args.falling = true;
				this.fallTime  = 0;
				this.jumpTimer = false;
			});
		}

		if(this.hat)
		{
			this.hat.args.direction = this.args.direction;
			this.hat.args.x = this.args.x;
			this.hat.args.y = this.args.y;

			if(this.fallTime > 9 || this.fallTime < 5)
			{
			 	this.hat.args.y += -14;
			}
			else
			{
			 	this.hat.args.y += -10;
			}

			this.hat.args.z = this.args.z + 1;

			this.viewport.setColCell(this.hat);
		}
	}

	effect(other)
	{
		super.effect(other);

		// this.viewport.spawn.add({object:new Flickie({
		// 	x: this.args.x,
		// 	y: this.args.y,
		// })});
	}

	pop(other)
	{
		if(!other.controllable)
		{
			return;
		}

		if(this.hat)
		{
			const hat = this.hat;

			this.viewport.onFrameOut(3, () => {
				hat.args.xSpeed = -4 * (Math.sign(other.args.xSpeed || other.args.gSpeed) || 1);
				hat.args.ySpeed = Math.min(-4, -Math.abs(other.args.ySpeed));
				hat.args.float  = 1;
				hat.noClip      = false;

				this.hat = null;
			});

			this.ignores.set(other, 10);

			other.args.gSpeed *= -1;
			other.args.xSpeed *= -1;
			other.args.ySpeed = -4;

			return;
		}

		return super.pop(other);
	}

	get solid() { return false; }
	get isEffect() { return false; }
	// get controllable() { return true; }
}
