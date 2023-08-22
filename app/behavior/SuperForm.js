import { Tag } from 'curvature/base/Tag';
import { Behavior } from './Behavior';

export class SuperForm extends Behavior
{
	command_3(host, button)
	{
		if(host.args.halted)
		{
			return;
		}

		const minRingsSuper = host.args.minRingsSuper ?? 50;
		const minRingsHyper = host.args.minRingsHyper ?? 75;

		if((host.isSuper && !host.isHyper && host.args.rings < minRingsHyper)
			|| (!host.args.falling || !host.args.jumping)
			|| host.args.rings < minRingsSuper
			|| host.args.ignore
			|| host.isHyper
		){
			host.isSuper = false;
			host.isHyper = false;
			host.setProfile();
			return;
		}

		if(!host.isHyper)
		{
			host.args.halted    = 45;
			host.args.animation = 'transform';
			host.args.jumping   = false;
			host.args.ySpeed    = Math.min(host.args.ySpeed, 0);
			host.args.flying    = false;
			host.args.dashed    = false;
		}

		if(host.isSuper)
		{
			host.isHyper = !host.isHyper;
		}
		else
		{
			host.isSuper = !host.isSuper;
		}

		host.transformTime = 0;

		host.setProfile();
	}

	updateEnd(host)
	{
		if(host.args.animation === 'transform')
		{
			host.transformTime++;
		}
		else if(host.transformTime > 0)
		{
			host.transformTime = 0;
		}
	}
}
