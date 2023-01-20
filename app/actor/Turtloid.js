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
	}

	updateStart()
	{
		if(this.standingUnder.size)
		{
			this.otherDefs.path = this.otherDefs.ridePath;
		}
		else
		{
			this.otherDefs.path = null;
		}

		super.updateStart();

		this.args.direction = Math.sign(this.args.x - this.xLast) || this.args.direction;
	}

	// sleep()
	// {
	// 	this.args.y = this.originalY;
	// }
}
