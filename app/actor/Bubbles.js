import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';

import { SkidDust } from '../behavior/SkidDust';
import { CanPop } from '../mixin/CanPop';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

export class Bubbles extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-bubbles';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 15;
		this.args.height    = 32;

		this.willStick = false;
		this.stayStuck = false;

		this.args.float = -1;

		this.sample = new Audio('/Sonic/object-destroyed.wav');
		this.sample.volume = 0.6 + (Math.random() * -0.3);

		this.aiming = false;
	}

	update()
	{
		this.args.ySpeed = this.yAxis;

		this.box.setAttribute('data-animation', 'standing');

		this.args.falling = true;
		this.args.flying  = true;

		super.update();
	}

	hold_1()
	{
		this.aiming = true;
	}

	release_1()
	{
		this.aiming = false;
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
	get controllable() { return true; }
}
