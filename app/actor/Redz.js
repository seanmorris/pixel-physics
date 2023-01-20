import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';

import { SkidDust } from '../behavior/SkidDust';
import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

import { Explosion } from '../actor/Explosion';
import { SpitFire } from '../actor/SpitFire';

export class Redz extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);
		this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-redz';

		this.args.animation = 'standing';

		// this.args.accel     = 0.1;
		// this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 18;
		this.args.height    = 32;

		this.willStick = false;
		this.stayStuck = false;

		this.args.patrolBeat    = this.args.patrolBeat    || 160;
		this.args.patrolPause   = this.args.patrolPause   || 60;
		this.args.patrolSpeed   = this.args.patrolSpeed   || 0.25;

		this.age = 0;
	}

	update()
	{
		super.update();

		const direction = this.args.direction = Math.sign(this.args.gSpeed) || this.args.direction;

		if(this.box)
		{
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
				this.box.setAttribute('data-animation', 'shooting');
			}
		}

		if(this.age % this.args.patrolBeat === this.args.patrolBeat - this.args.patrolPause)
		{
			const spitFire = new SpitFire({
				owner: this
				, direction
				, x: this.x + 59 * direction
				, y: this.y - 3
				, z: this.z + 1
			});

			const viewport = this.viewport;

			viewport.spawn.add({object:spitFire});

			this._onRemove.add(() => viewport.actors.remove(spitFire));
		}

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
