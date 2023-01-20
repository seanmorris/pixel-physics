import { Block } from './Block';

import { Sfx } from '../audio/Sfx';

export class PropellerPlatform extends Block
{
	constructor(...args)
	{
		super(...args);

		this.args.maxClimb = this.args.maxClimb ?? 256;
		this.args.width    = 64;
		this.args.height   = 53;
		this.args.platform = 1;
		this.args.type     = 'actor-item actor-propeller-platform';
		this.args.static   = 0;
		this.args.gravity  = 0.20;
		this.args.spinning = 0;
		this.args.bouncing = 0;
	}

	onRendered()
	{
		super.onRendered();

		this.autoAttr.get(this.box)['data-spinning'] = 'spinning';
		this.autoAttr.get(this.box)['data-bouncing'] = 'bouncing';
	}

	update()
	{
		this.args.cameraBias = -0.2;

		if(this.args.spinning > 0)
		{
			this.args.spinning--;
		}
		else
		{
			this.args.spinning = 0;
		}

		if(this.args.bouncing > 0)
		{
			this.args.bouncing--;
		}
		else
		{
			this.args.bouncing = 0;
		}

		const maxClimb = this.originalY + -this.args.maxClimb;

		if(this.args.y > this.originalY)
		{
			this.args.y = this.originalY;
			this.args.ySpeed = 0;
			this.args.float = -1;
		}

		if(this.args.y < maxClimb)
		{
			this.args.float = 30;
			this.args.y = maxClimb;
			this.args.ySpeed = Math.max(0, this.args.ySpeed);
		}

		super.update();
	}

	collideA(other, type)
	{
		if(other.args.static)
		{
			return;
		}

		if(other.args.falling
			&& other.args.y > this.args.y + -this.args.height
			&& other.args.y < this.args.y + -(this.args.height * 0.75)
		){
			other.args.y = this.args.y + -this.args.height + this.args.ySpeed + 3;
			return super.collideA(other, type);
		}

		if(!other.args.falling || other.args.ySpeed < 0)
		{
			return super.collideA(other, type);
		}

		// if(!other.controllable)
		// {
		// 	return super.collideA(other, type);
		// }

		this.args.ySpeed += Math.min(-4, -Math.abs(other.args.ySpeed) * 0.5);
		this.args.float    = 10;
		this.args.spinning = 30;
		this.args.bouncing = 10;

		other.args.xSpeed *= 0.5;
		other.doubleSpin = false;

		if(other.dashed)
		{
			other.dashed = false;
			other.args.xSpeed = 0;
			other.args.ySpeed = -other.args.airSpeed;
			other.args.ySpeed *= 1.25;
			this.args.ySpeed *= 1.75;
		}
		else
		{
			if(other.args.ySpeed > 0)
			{
				other.args.ySpeed = Math.min(-4, Math.max(-6, -Math.abs(other.args.ySpeed)));
				other.args.ySpeed += this.args.ySpeed;
			}

			if(other.args.ySpeed > this.args.ySpeed)
			{
				other.args.ySpeed = this.args.ySpeed + -6;
			}
		}

		Sfx.play('PROP_PLAT');

		this.args.y--;
		this.args.falling = true;

		if(other.args.animation === 'airdash')
		{
			other.args.animation = 'flip';
		}

		return super.collideA(other, type);
	}
}
