import { Monitor } from '../Monitor';

import { StarSheild } from '../../powerups/StarSheild';

export class SheildStarMonitor extends Monitor
{
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

		other.powerups.add(sheild);
		other.inventory.add(sheild);
	}
}
