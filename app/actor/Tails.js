import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class Tails extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type      = 'actor-item actor-tails';

		this.args.accel     = 0.32;
		this.args.decel     = 0.7;

		this.args.gSpeedMax = 28;
		this.args.jumpForce = 18;
		this.args.gravity   = 1;

		this.args.skidTraction = 1.75;


		this.args.width  = 16;
		this.args.height = 32;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.tails = new Tag('<div class = "tails-tails">');
		this.sprite.appendChild(this.tails.node);
	}

	update()
	{
		const falling = this.args.falling;

		if(this.viewport.args.audio && !this.flyingSound)
		{
			this.flyingSound = new Audio('/Sonic/tails-flying.wav');

			this.flyingSound.volume = 0.35 + (Math.random() * -0.2);
			this.flyingSound.loop   = true;
		}

		if(!this.flyingSound.paused)
		{
			this.flyingSound.volume = 0.35 + (Math.random() * -0.2);
		}

		if(this.flyingSound.currentTime > 0.2)
		{
			this.flyingSound.currentTime = 0.0;
		}

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
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

		if(this.args.tailFlyCoolDown == 0)
		{
			if(this.args.ySpeed > 5)
			{
				this.flyingSound.pause();
		 		this.args.flying = false;
			}
		}
		else if(this.args.tailFlyCoolDown > 0)
		{
			this.args.tailFlyCoolDown--;
		}

		super.update();
	}

	command_0()
	{
		if(!this.args.falling)
		{
			super.command_0();

			return;
		}

		if(!this.args.flying)
		{
			this.args.tailFlyCoolDown = 25;
			this.args.flying = true;
		}
	}

	release_0(button)
	{
		this.args.tailFlyCoolDown = 0;
		this.args.flying = false;
	}

	hold_0(button)
	{
		if(!this.public.flying)
		{
			return;
		}

		if(this.public.ySpeed < 1)
		{
			if(!this.public.flying)
			{
				this.flyingSound.play();
			}

			this.args.ySpeed = this.args.ySpeed < 0 ? this.args.ySpeed : -1;
			this.args.float  = 8;
		}
	}

	get solid() { return false; }
	get canRoll() { return true; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
