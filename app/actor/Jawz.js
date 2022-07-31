import { Flickie } from './Flickie';

import { Spring } from './Spring';

import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';

import { CanPop } from '../mixin/CanPop';

export class Jawz extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.args.type      = 'actor-item actor-jawz';

		this[Spring.WontSpring] = true;

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 56;
		this.args.height    = 16;

		this.willStick = false;
		this.stayStuck = false;

		this.args.float = -1;

		this.noClip = true;
	}

	onRendered()
	{
		super.onRendered();

		this.box.setAttribute('data-animation', 'standing');
	}

	update()
	{
		// this.args.facing  = 'right';
		this.args.facing  = 'left';

		if(this.args.xSpeed > -4)
		{
			this.args.xSpeed -= 0.2;
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

	get solid() { return false; }
	get isEffect() { return false; }
}
