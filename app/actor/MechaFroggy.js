import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { SkidDust } from '../behavior/SkidDust';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

export class MechaFroggy extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-mecha-froggy';

		this.args.animation = 'standing';

		this.args.accel     = 0.7;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 10;
		this.args.jumpForce = 15;
		this.args.gravity   = 0.5;

		this.args.width     = 15;
		this.args.height    = 32;

		this.willStick = false;
		this.stayStuck = false;
	}

	update()
	{
		const direction = this.args.direction;

		if(!this.flame)
		{
			this.flame = new Tag('<div class = "mecha-froggy-flame">');
			this.sprite.appendChild(this.flame.node);
		}

		if(!this.args.jumping || this.args.falling)
		{
			if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(this.args.moving && this.args.gSpeed && Math.abs(this.args.gSpeed) >= 10)
			{
				this.box.setAttribute('data-animation', 'running');
			}
			else if(this.args.moving && this.args.gSpeed && Math.abs(this.args.gSpeed))
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}

		if(this.args.jumping)
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		super.update();
	}

	get solid() { return false; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
