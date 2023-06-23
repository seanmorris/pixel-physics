import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';
import { Tag } from 'curvature/base/Tag';

export class ChainShot extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width   = 16;
		this.args.height  = 128;
		this.args.type    = 'actor-item actor-chain-shot';
		this.args.float   = -1;

		this.args.shooting = false;

		this.args.animation = 'idle';
	}

	update()
	{
		super.update();

		if(this.args.animation === 'shooting' && this.viewport.args.frameId % 5 === 0)
		{
			Sfx.play('CHOPPER_GUN', {});
		}
	}

	collideA(other)
	{
		if(!this.args.shooting || !other.controllable)
		{
			return;
		}

		other.damage(this);
	}
}
