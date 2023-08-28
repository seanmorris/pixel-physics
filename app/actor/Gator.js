import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

export class Gator extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-gator-bot';

		this.args.animation = 'standing';

		this.args.accel     = 0.75;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 15;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 44;
		this.args.height    = 32;

		this.args.patrolPause   = this.args.patrolPause   ?? 20;
		this.args.patrolBeat    = this.args.patrolBeat    ?? 110;
		this.args.patrolSpeed   = this.args.patrolSpeed   ?? 1;

		this.chasing = false;
	}

	onRendered(event)
	{
		super.onRendered(event);
	}

	update()
	{
		if(this.viewport && this.viewport.controlActor)
		{
			const space = Math.abs(this.viewport.controlActor.args.x - this.args.x);

			if(space < 64)
			{
				this.box.setAttribute('data-animation', 'chomping');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
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
