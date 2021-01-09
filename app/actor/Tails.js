import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class Tails extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.controllable   = true;

		this.args.type      = 'actor-item actor-tails';

		this.args.accel     = 0.14;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 25;
		this.args.jumpForce = 17;
		this.args.gravity   = 0.8;

		this.args.width     = 1;
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

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(gSpeed === 0)
			{
				this.box.setAttribute('data-animation', 'standing');
			}
			else if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(speed > maxSpeed / 2)
			{
				this.box.setAttribute('data-animation', 'running');
			}
			else
			{
				this.box.setAttribute('data-animation', 'walking');
			}
		}
		else if(this.args.flying)
		{
			this.box.setAttribute('data-animation', 'flying');
		}
		else if(this.args.falling)
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		if(this.args.tailFlyCoolDown == 0 && this.args.ySpeed > 5)
		{
			this.args.flying = false;
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
			this.args.tailFlyCoolDown = 15;

			super.command_0();

			return;
		}

		if(this.args.tailFlyCoolDown > 0)
		{
			return;
		}

		if(this.args.ySpeed > 1)
		{
			this.args.flying = true;

			if(this.args.tailFlyCoolDown == 0)
			{
				this.args.tailFlyCoolDown = 7;
			}

			this.args.ySpeed = -1;
			this.args.float  = 8;
		}
	}

	get solid() { return true; }
	get isEffect() { return false; }
}
