import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { Twist } from '../effects/Twist';
import { Pinch } from '../effects/Pinch';

import { Png } from '../sprite/Png';

export class Sonic extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type      = 'actor-item actor-sonic';

		this.args.accel     = 0.35;
		this.args.decel     = 0.7;

		this.args.skidTraction = 1.75;

		this.args.gSpeedMax = 30;
		this.args.jumpForce = 18;
		this.args.gravity   = 1;

		this.args.width  = 32;
		this.args.height = 40;

		this.spindashCharge = 0;

		if(!Sonic.png)
		{
			Sonic.png = new Png('/Sonic/sonic.png');
		}
	}

	onAttached()
	{
		this.box    = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.twister = new Twist;

		this.viewport.effects.add(this.twister);

		// this.args.fgFilter = `url(#twist)`;
		this.args.bgFilter = `url(#twist)`;
	}

	update()
	{
		const falling = this.args.falling;

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			const direction = this.public.direction;
			const gSpeed    = this.public.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.public.gSpeedMax;

			if(this.spindashCharge)
			{
				this.box.setAttribute('data-animation', 'spindash');
			}
			else if(!this.public.rolling)
			{
				if(Math.sign(this.public.gSpeed) !== direction && Math.abs(this.public.gSpeed - direction) > 5)
				{
					this.box.setAttribute('data-animation', 'skidding');
				}
				else if(speed > maxSpeed / 2)
				{
					this.box.setAttribute('data-animation', 'running');
				}
				else if(this.public.moving && this.public.gSpeed)
				{
					this.box.setAttribute('data-animation', 'walking');
				}
				else
				{
					this.box.setAttribute('data-animation', 'standing');
				}
			}
			else
			{
				this.box.setAttribute('data-animation', 'rolling');
			}

		}
		else
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		super.update();

		// this.twister.args.scale = Math.abs(this.args.gSpeed);

		if(this.skidding && !this.public.rolling && !this.public.falling && !this.spindashCharge)
		{
			if(this.twister)
			{
				this.twister.args.scale = -this.public.gSpeed;
			}
		}
		else if(!this.spindashCharge)
		{
			this.twister.args.scale = 0;
		}
	}

	release_1() // spindash
	{
		const direction = this.public.direction;
		let   dashPower = this.spindashCharge / 40;

		if(dashPower > 1)
		{
			dashPower = 1;
		}

		this.args.rolling = true;

		const dashBoost = dashPower * 80 * direction;

		if(Math.sign(direction) !== Math.sign(dashBoost))
		{
			this.args.gSpeed = dashBoost;
		}
		else
		{
			this.args.gSpeed += dashBoost;
		}

		this.spindashCharge = 0;
	}

	hold_1(button) // spindash
	{
		if(this.args.falling || this.willJump)
		{
			return;
		}

		this.spindashCharge++;

		let dashCharge = this.spindashCharge / 20;

		if(dashCharge > 1)
		{
			dashCharge = 1;
		}

		if(this.twister)
		{
			this.twister.args.scale = 60 * dashCharge * this.public.direction
		}

		this.box.setAttribute('data-animation', 'spindash');
	}

	get solid() { return false; }
	get canRoll() { return true; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
