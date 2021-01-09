import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class Knuckles extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.controllable   = true;

		this.args.type      = 'actor-item actor-knuckles';

		this.args.accel     = 0.13;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 20;
		this.args.jumpForce = 15;
		this.args.gravity   = 0.8;

		this.args.width     = 1;
	}

	onAttached()
	{
		this.box = this.findTag('div');
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

			this.args.knucklesFlyCoolDown = 15;

			this.args.flying = false;

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
		else
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		// if(this.args.knucklesFlyCoolDown == 0 && this.args.ySpeed > 5)
		// {
		// 	this.args.flying = false;
		// }

		if(this.args.knucklesFlyCoolDown > 0)
		{
			this.args.knucklesFlyCoolDown--;
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

		if(this.args.knucklesFlyCoolDown > 0)
		{
			return;
		}

		if(this.args.ySpeed > 1)
		{
			this.args.flying = true;
		}

		if(this.args.flying)
		{
			if(this.args.ySpeed > 0)
			{
				this.args.ySpeed = 0;
			}

			if(this.args.ySpeed < 1)
			{
				this.args.ySpeed += 1;
			}

			if(this.args.ySpeed > 1)
			{
				this.args.ySpeed -= 1;
			}

			if(!this.xAxis)
			{
				this.args.xSpeed += 0.15625 * this.args.direction;
			}

			this.args.float = 3;
		}
	}

	get solid() { return true; }
	get isEffect() { return false; }
}
