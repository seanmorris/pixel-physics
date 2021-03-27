import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { SkidDust } from '../behavior/SkidDust';

export class Tails extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-tails';

		this.args.accel     = 0.35;
		this.args.decel     = 0.4;

		this.args.flySpeedMax = 25;

		this.args.gSpeedMax = 16;
		this.args.jumpForce = 11;
		this.args.gravity   = 0.5;

		this.args.skidTraction = 1.75;

		this.args.width  = 28;
		this.args.height = 32;

		this.args.normalHeight  = 32;
		this.args.rollingHeight = 23;

		this.willStick = false;
		this.stayStuck = false;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.tails = new Tag('<div class = "tails-tails">');
		this.sprite.appendChild(this.tails.node);

		this.flyingSound = new Audio('/Sonic/tails-flying.wav');

		this.flyingSound.volume = 0.35 + (Math.random() * -0.3);
		this.flyingSound.loop   = true;
	}

	update()
	{
		const falling = this.args.falling;

		if(this.viewport.args.audio && this.flyingSound)
		{
			if(!this.flyingSound.paused)
			{
				this.flyingSound.volume = 0.35 + (Math.random() * -0.3);
			}

			if(this.flyingSound.currentTime > 0.2)
			{
				this.flyingSound.currentTime = 0.0;
			}
		}

		if(!this.box)
		{
			super.update();
			return;
		}

		if(this.public.tailFlyCoolDown > 0)
		{
			this.args.tailFlyCoolDown--;
		}

		if(this.public.tailFlyCoolDown < 0)
		{
			this.args.tailFlyCoolDown++;
		}

		if(this.args.tailFlyCoolDown === 0)
		{
			this.flyingSound.pause();
	 		this.args.flying = false;
		}

		if(!falling)
		{
			this.args.tailFlyCoolDown =  0;

			this.flyingSound.pause();

			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(!this.public.rolling)
			{
				if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
				{
					this.box.setAttribute('data-animation', 'skidding');
				}
				else if(speed > maxSpeed / 2)
				{
					this.box.setAttribute('data-animation', 'running');
				}
				else if(this.args.moving && this.args.gSpeed)
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
		else if(this.args.flying)
		{
			if(this.yAxis > 0)
			{
				this.box.setAttribute('data-animation', 'jumping');
				this.args.ySpeed = this.args.jumpForce;
			}
			else
			{
				this.box.setAttribute('data-animation', 'flying');
			}
		}
		else if(this.args.falling)
		{
			this.flyingSound.pause();
			this.box.setAttribute('data-animation', 'jumping');
		}

		super.update();
	}

	command_0(button)
	{
		super.command_0(button);

		if(!this.public.falling)
		{
			this.args.tailFlyCoolDown = -80;
			return;
		}

		if(this.args.tailFlyCoolDown === 0)
		{
			this.args.tailFlyCoolDown = 80;
			return;
		}

		if(this.public.ySpeed > 0)
		{
			this.args.ySpeed = 0;
		}

		this.args.tailFlyCoolDown = 80;

		this.args.flying = true;

		this.flyingSound.volume = 0.35 + (Math.random() * -0.3);

		if(this.viewport.args.audio && this.flyingSound.paused)
		{
			this.flyingSound.play();
		}
	}

	hold_0(button)
	{
		if(this.public.flying)
		{
			if(this.args.ySpeed > 0)
			{
				this.args.ySpeed = 0;
			}

			if(Math.random() > 0.8)
			{
				this.flyingSound.volume = 0.35 + (Math.random() * -0.3);
			}

			this.args.tailFlyCoolDown = 80;

			this.args.ySpeed -= Math.min(3, (button.time / 9));

			this.args.ySpeed = Math.max(-5, this.args.ySpeed);
		}
		else
		{
			this.args.flying = true;
		}
	}

	sleep()
	{
		this.flyingSound && this.flyingSound.pause();
	}

	get solid() { return false; }
	get canRoll() { return true; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
