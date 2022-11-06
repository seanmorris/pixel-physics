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
		super.update();

		if(this.args.active)
		{
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

		if(this.args.ySpeed < -3)
		{
			this.args.ySpeed = -3;
		}

		this.args.falling = true;

		return super.collideA(other, type);
	}
}
