import { Vehicle } from './Vehicle';

import { Tag } from 'curvature/base/Tag';

import { SkidDust } from '../behavior/SkidDust';

export class SnowBoard extends Vehicle
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust('particle-dust behind'));

		this.args.type = 'actor-item actor-snow-board';

		this.args.width  = 32;
		this.args.height = 48;

		this.removeTimer = null;

		this.args.gSpeedMax = 20;
		this.args.decel     = 0.25;
		this.args.accel     = 0.75;
		this.args.gravity   = 0.75;
		// this.args.ignore    = -1;

		this.args.seatHeight = 1;

		this.args.skidTraction = 0.5;
		this.args.jumpForce = 9.5;

		this.dustCount = 0;

		this.args.particleScale = 2;

		this.args.started = false;

		this.ridingAnimation = 'grinding';
		// this.alwaysSkidding  = true;
		this.dustDist = -16;
		this.dustFreq = 1;
		this.broad = true;

		this.slowSpin = true;
	}

	update()
	{
		this.originalSpeed = this.public.gSpeed || this.public.xSpeed;

		super.update();

		if(this.occupant)
		{
			this.args.z = this.occupant.args.z - 1;
		}

		if(this.public.gSpeed !== 0 || this.public.xSpeed !== 0)
		{
			this.sprite.classList.add('moving');

			this.args.started = true;
		}
	}

	doJump(force)
	{
		super.doJump(force);

		this.args.groundAngle += (Math.PI * 0.125) * Math.sign(this.args.gSpeed || this.args.direction);
	}

	get solid() { return !this.occupant; }
}
