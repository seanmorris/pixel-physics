import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';

import { SkidDust } from '../behavior/SkidDust';
import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

export class BFish extends Mixin.from(PointActor, CanPop)
{
	constructor(args = {}, parent)
	{
		const jumpForce = args.jumpForce || 14;

		super(args, parent);

		this.behaviors.add(new SkidDust);
		this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-b-fish';

		this.args.animation = 'standing';

		// this.args.accel     = 0.1;
		// this.args.decel     = 0.5;

		this.noClip         = true;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = jumpForce || 14;
		this.args.jumpDelay = this.args.jumpDelay || 0;
		this.args.gravity   = 0.5;

		this.args.width     = 24;
		this.args.height    = 32;

		this.willStick = false;
		this.stayStuck = false;
	}

	update()
	{
		const yStart = this.def.get('y');

		if(this.age <= this.args.jumpDelay)
		{
			this.args.float = -1;
		}
		else
		{
			this.args.float = false;
		}

		if(this.age > this.args.jumpDelay && this.args.y > yStart)
		{
			this.viewport.onNextFrame(() => this.args.ySpeed = -this.args.jumpForce);
		}

		super.update();
	}

	get solid() { return false; }
	get isEffect() { return false; }
	// get controllable() { return true; }
}
