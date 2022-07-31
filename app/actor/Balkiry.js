import { Flickie } from './Flickie';

import { Spring } from './Spring';

import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';

import { SkidDust } from '../behavior/SkidDust';
import { CanPop } from '../mixin/CanPop';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

export class Balkiry extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.args.type      = 'actor-item actor-balkiry';

		this[Spring.WontSpring] = true;

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 32;
		this.args.height    = 16;

		this.willStick = false;
		this.stayStuck = false;

		this.args.float = -1;

		this.noClip = true;
	}

	onRendered()
	{
		super.onRendered();

		this.flame = new Tag('<div class = "balkiry-flame">');

		this.sprite.appendChild(this.flame.node);

		this.box.setAttribute('data-animation', 'standing');
	}

	update()
	{
		// this.args.facing  = 'right';
		this.args.facing  = 'left';

		if(this.args.xSpeed > -12)
		{
			this.args.xSpeed -= 0.1;
		}

		this.args.ySpeed  = 0;
		this.args.falling = true;
		this.args.flying  = true;

		super.update();
	}

	effect(other)
	{
		super.effect(other);

		// this.viewport.spawn.add({object:new Flickie({
		// 	x: this.args.x,
		// 	y: this.args.y,
		// })});
	}

	wakeUp()
	{
	}

	sleep()
	{
		// this.args.x = this.def.get('x');
		// this.args.y = this.def.get('y');
	}

	get solid() { return false; }
	// get controllable() { return true; }
	get isEffect() { return false; }
}
