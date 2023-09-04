import { Block } from './Block';

import { Sfx } from '../audio/Sfx';

export class Turtloid extends Block
{
	constructor(...args)
	{
		super(...args);

		this.args.width    = 56;
		this.args.height   = 24;
		this.args.platform = 1;
		this.args.float    = -1;
		this.args.type     = 'actor-item actor-turtloid';
		this.args.static   = 0;
		this.args.pathSpeed = 4;
	}

	updateStart()
	{
		if(this.standingUnder.size && (!this.others.guard || this.others.guard.removed))
		{
			this.otherDefs.path = this.otherDefs.ridePath;

		}
		else
		{
			this.otherDefs.path = null;

		}

		super.updateStart();

		if(this.xLast)
		{
			this.args.direction = Math.sign(this.args.x - this.xLast) || this.args.direction;
		}

		const xSpeed = this.xLast - this.args.x;
		const ySpeed = this.yLast - this.args.y;

		if(xSpeed)
		{
			this.args.animation = 'swimming';
		}
		else if(ySpeed)
		{
			this.args.animation = 'sinking';
		}
		else
		{
			this.args.animation = 'idle';
		}
	}

	// sleep()
	// {
	// 	this.args.y = this.originalY;
	// }
}
