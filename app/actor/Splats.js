import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

export class Splats extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-splats';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 24;
		this.args.height    = 48;

		this.willStick = false;
		this.stayStuck = false;

		this.args.patrolPause = this.args.patrolPause   ?? 40;
		this.args.patrolBeat  = this.args.patrolBeat    ?? 140;
		this.args.patrolSpeed = this.args.patrolSpeed   ?? 1;
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

		this.args.direction = Math.sign(this.args.xSpeed || this.args.gSpeed);

		if(!this.args.falling && !this.jumpTimer)
		{
			this.jumpTimer = this.onNextFrame(() => {
				this.args.ySpeed = Math.max(-this.ySpeedLast, -12) || -6;
				this.args.xSpeed = this.args.gSpeed;
				this.args.falling = true;
				this.jumpTimer = false;
				this.args.y -= 32;
			});
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

	get solid() { return false; }
	get isEffect() { return false; }
	// get controllable() { return true; }
}
