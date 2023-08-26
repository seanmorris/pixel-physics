import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

export class RhinoBot extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		// this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-rhino-bot';

		this.args.animation = 'standing';

		this.args.accel     = 0.75;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 15;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 44;
		this.args.height    = 32;

		// this.args.patrolPause   = this.args.patrolPause   ?? 20;
		// this.args.patrolBeat    = this.args.patrolBeat    ?? 120;
		// this.args.patrolSpeed   = this.args.patrolSpeed   ?? 4;

		// this.args.tailOffset = 0;

		this.chasing = false;
	}

	onRendered(event)
	{
		super.onRendered(event);
	}

	update()
	{
		// const direction = this.args.direction;
		const telegraph = this.args.shotTelegraph;
		const beat      = this.args.patrolBeat;

		const moved = this.args.x - this.xLast;

		this.args.tailOffset += isNaN(moved) ? 0 : moved;

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

		if(this.viewport && this.viewport.controlActor)
		{
			if(Math.abs(this.viewport.controlActor.args.x - this.args.x) < 768)
			{
				this.chasing = this.viewport.controlActor;
			}
		}

		if(this.chasing)
		{
			this.args.gSpeed += (this.chasing.args.x - this.args.x) * 0.1;

			const diff = Math.abs(this.chasing.args.x - this.chasing.args.x);

			const maxSpeed = Math.max(6, Math.abs(this.chasing.args.gSpeed || this.chasing.args.xSpeed) * (diff > 256 ? 1.2 : 1));

			if(Math.abs(this.args.gSpeed) > maxSpeed)
			{
				this.args.gSpeed = Math.sign(this.args.gSpeed) * maxSpeed;
			}
		}

		super.update();

		this.args.direction = Math.sign(this.args.gSpeed);
		this.args.facing = this.args.direction > 0 ? 'right' : 'left';
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
