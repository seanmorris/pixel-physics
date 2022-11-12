import { Monitor } from '../Monitor';

import { StarSheild } from '../../powerups/StarSheild';

export class SheildStarMonitor extends Monitor
{
	name = 'Star Monitor';

	onRendered(event)
	{
		super.onRendered(event);

		this.box.attr({'data-monitor':'sheild-star'});
	}

	effect(other)
	{
		if(!other.controllable)
		{
			return;
		}

		const sheild = new StarSheild;

		other.inventory.add(sheild);
	}
}
