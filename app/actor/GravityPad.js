import { PointActor } from './PointActor';
import { Block } from './Block';

import { Sfx } from '../audio/Sfx';

export class GravityPad extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.width  = this.args.width || 24;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-gravity-pad';
		this.args.float = -1;
	}

	collideA(other)
	{
		if(other.args.mode || other.args.float || other.args.static)
		{
			return;
		}

		other.args.float = 1;
		other.args.xSpeed = other.args.xSpeed || other.args.gSpeed;

		if(Math.abs(other.xLast - other.args.x) > 5)
		{
			other.args.ignore = 1;
		}

		other.args.ySpeed = Math.min(0, other.args.ySpeed);
		other.args.falling = true;

		if(other.args.y > this.args.y + -this.args.height)
		{
			other.args.y -= 1;
			other.args.ySpeed -= 0.50;
		}
		else
		{
			other.args.ySpeed *= 0.25;
		}

		if(other.args.y >= this.args.y + -(this.args.height * 0.5))
		{
			other.args.ySpeed -= 1;
		}

		other.args.animation = 'flip';

		other.args.jumping = false;
		other.dashed  = false;
	}
}
