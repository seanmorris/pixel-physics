import { Tag  } from 'curvature/base/Tag';

import { Behavior } from './Behavior';

export class LookUp extends Behavior
{
	update(host)
	{
		if(host.args.mode !== 0)
		{
			return;
		}

		if(host.yAxis < -0.55 && !host.args.gSpeed && !host.args.falling && !host.spindashCharge)
		{
			host.args.animation = 'looking-up';
			host.args.lookTime++;
		}
	}
}
