import { Tag  } from 'curvature/base/Tag';

import { Behavior } from './Behavior';

export class Crouch extends Behavior
{
	spindashCharge = 0;

	command_0(host, button)
	{
		if(host.yAxis > 0.55 && !host.args.falling && !host.args.gSpeed)
		{
			// return false;
		}
	}

	update(host)
	{
		if(host.args.grinding)
		{
			if(host.yAxis > 0.55)
			{
				host.args.animation = 'grinding-crouching';
				host.args.crouching = true;
			}
			else
			{
				host.args.crouching = false;
			}
			return;
		}

		if(host.yAxis > 0.55 && !host.args.gSpeed && !host.args.falling && !host.spindashCharge)
		{
			host.args.lookTime--;

			if(host.args.lookTime < -45)
			{
				host.args.cameraBias = -0.5;
			}

			host.args.animation = 'crouching';

			host.args.crouching = true;
		}
		else
		{
			host.args.crouching = false;
		}
	}
}
