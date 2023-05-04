import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';

import { SkidDust } from '../behavior/SkidDust';
import { CanPop } from '../mixin/CanPop';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

export class Sping extends Mixin.from(PointActor, CanPop)
{
	name = 'Spiny';

	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-sping';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 48;
		this.args.height    = 22;

		this.willStick = false;
		this.stayStuck = false;
	}

	update()
	{
		const direction = this.args.direction;

		const speed = 0.125;
		const beat  = 90;

		if(this.age % beat < (beat - 25))
		{
			if(Math.floor(this.age / beat) % 2)
			{
				this.args.gSpeed = -speed;
			}
			else
			{
				this.args.gSpeed = speed;
			}
		}

		if(this.box)
		{
			this.box.setAttribute('data-animation', 'walking');

			if(this.age % beat < 15 || this.age % beat > (beat - 5))
			{
				this.box.setAttribute('data-animation', 'shooting');
			}
		}

		super.update();

		if(this.age % beat === (beat - 3))
		{
			const x = this.x - 2;
			const y = this.y - 12;
			const z = -1;

			const xSpeed = -1.5 * Math.sign(this.gSpeedLast);
			const ySpeed = -3;

			const owner = this;

			const ball = new Projectile({x,y,z,owner});

			if(!this.viewport)
			{
				return;
			}

			this.viewport.onFrameOut(2, () => {
				Object.assign(ball.args, {xSpeed,ySpeed});
			});

			this.viewport.spawn.add({object:ball})
		}
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
