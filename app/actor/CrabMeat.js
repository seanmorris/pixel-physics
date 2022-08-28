import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';

import { SkidDust } from '../behavior/SkidDust';
import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

export class CrabMeat extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);
		this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-crabmeat';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 32;
		this.args.height    = 32;

		this.willStick = false;
		this.stayStuck = false;

		this.args.patrolBeat    = this.args.patrolBeat    || 90;
		this.args.patrolPause   = this.args.patrolPause   || 25;
	 	this.args.patrolSpeed   = this.args.patrolSpeed   || 0.25;
		this.args.shotTelegraph = this.args.shotTelegraph || 65;

		this.age = 0;
	}

	update()
	{
		const direction = this.args.direction;

		super.update();

		const telegraph = this.args.shotTelegraph;
		const beat      = this.args.patrolBeat;

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
			else if(this.age % beat < telegraph || this.age % beat > (beat - 15))
			{
				this.box.setAttribute('data-animation', 'shooting');
			}
			else
			{

				this.box.setAttribute('data-animation', 'standing');
			}
		}

		if(this.age % beat === (beat - 3))
		{
			const xA = this.x +  19;
			const xB = this.x + -19;
			const y  = this.y + -19;
			const z  = -1;

			const xSpeed = -1.5;
			const ySpeed = -3;

			const owner = this;

			const ballA = new Projectile({x:xA,y,z,owner});
			const ballB = new Projectile({x:xB,y,z,owner});

			this.viewport.onFrameOut(3, () => {
				Object.assign(ballA.args, {xSpeed:-xSpeed,ySpeed});
				Object.assign(ballB.args, {xSpeed,ySpeed});
			});

			this.viewport.spawn.add({object:ballA});
			this.viewport.spawn.add({object:ballB});
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
