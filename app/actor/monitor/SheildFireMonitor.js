import { Monitor } from '../Monitor';

import { FireSheild } from '../../powerups/FireSheild';

export class SheildFireMonitor extends Monitor
{
	attached(event)
	{
		super.attached(event);

		this.box.attr({'data-monitor':'sheild-fire'});
	}

	effect(other)
	{
		if(!other.controllable)
		{
			return;
		}

		const sheild = new FireSheild;

		other.powerups.add(sheild);
		other.inventory.add(sheild);
	}
}
