import { Tag  } from 'curvature/base/Tag';

import { Behavior } from './Behavior';

export class LookUp extends Behavior
{
	lookTime = 0;

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

			if(host.args.lookTime > 45)
			{
				host.args.cameraBias = +0.25;
			}
		}
		else
		{
			this.lookTime = 0;
		}
	}
}
