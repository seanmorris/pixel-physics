import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';

import { SkidDust } from '../behavior/SkidDust';
import { CanPop } from '../mixin/CanPop';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

export class CrabMeat extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-crabmeat';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 18;
		this.args.height    = 32;

		this.willStick = false;
		this.stayStuck = false;

		this.sample = new Audio('/Sonic/object-destroyed.wav');
		this.sample.volume = 0.6 + (Math.random() * -0.3);
	}

	update()
	{
		const direction = this.args.direction;

		if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
		{
			this.box.setAttribute('data-animation', 'skidding');
		}
		else if(this.args.moving && this.args.gSpeed)
		{
			this.box.setAttribute('data-animation', 'walking');
		}
		else
		{
			this.box.setAttribute('data-animation', 'standing');
		}

		super.update();
	}

	effect(other)
	{
		// this.viewport.spawn.add({object:new Flickie({
		// 	x: this.args.x,
		// 	y: this.args.y,
		// })});
	}

	get solid() { return false; }
	get isEffect() { return false; }
	// get controllable() { return true; }
}