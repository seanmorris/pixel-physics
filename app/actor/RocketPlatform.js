import { Block } from './Block';

import { Sfx } from '../audio/Sfx';

export class RocketPlatform extends Block
{
	constructor(...args)
	{
		super(...args);

		this.args.width    = 96;
		this.args.height   = 64;
		this.args.platform = 1;
		this.args.type     = 'actor-item actor-rocket-platform';
		this.args.static   = 0;

		this.args.activeTime = 0;
	}

	update()
	{
		this.args.cameraBias = 0.2;

		if(this.standingUnder.size)
		{
			this.args.activeTime++
		}
		else
		{
			this.args.activeTime = 0;
		}

		for(const other of this.standingUnder)
		{
			if(other.args.dead)
			{
				// this.args.y += -this.args.ySpeed;
				this.args.ySpeed = 0;
				this.standingUnder.delete(other);
			}
			else if(!this.args.falling)
			{
				other.args.y = Math.round(other.args.y);
			}
		}

		super.update();

		if(this.args.activeTime > 1)
		{
			this.args.ySpeed -= 0.1;
			this.args.float = 1

			if(!this.args.falling)
			{
				this.args.falling = true;
				this.args.ySpeed = -1;
				this.args.y--;
			}
		}

	}

	collideA(other, type)
	{
		if(type !== 0)
		{
			return super.collideA(other, type);
		}

		if(!other.controllable)
		{
			return super.collideA(other, type);
		}

		this.args.ySpeed -= 0.1;
		this.args.float = 1;

		if(this.args.ySpeed < -3)
		{
			this.args.ySpeed = -3;
		}

		return super.collideA(other, type);
	}
}
