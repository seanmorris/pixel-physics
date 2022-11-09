import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

export class TechnoSqueak extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-techno-squeak';

		this.args.animation = 'standing';

		this.args.accel     = 0.75;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 15;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 24;
		this.args.height    = 14;

		this.willStick = false;
		this.stayStuck = false;

		this.args.patrolPause   = this.args.patrolPause   ?? 20;
		this.args.patrolBeat    = this.args.patrolBeat    ?? 120;
		this.args.patrolSpeed   = this.args.patrolSpeed   ?? 4;

		this.args.tailOffset = 0;

		this.stayStuck = true;

		this.age = 0;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--tailOffset'] = 'tailOffset';
	}

	update()
	{
		// const direction = this.args.direction;
		const telegraph = this.args.shotTelegraph;
		const beat      = this.args.patrolBeat;

		this.args.tailOffset += this.args.x - this.xLast;

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

		// this.args.direction = Math.sign(this.args.gSpeed);

		this.age++;
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
