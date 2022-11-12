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
	}

	update()
	{
		for(const other of this.standingUnder)
		{
			if(other.args.dead)
			{
				// this.args.y += -this.args.ySpeed;
				this.args.ySpeed = 0;
				this.standingUnder.delete(other);
			}
		}

		super.update();
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

		if(!this.args.falling)
		{
			this.args.y--;
		}

		this.args.falling = true;

		return super.collideA(other, type);
	}
}
