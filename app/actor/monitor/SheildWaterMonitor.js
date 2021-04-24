import { Monitor } from '../Monitor';

import { BubbleSheild } from '../../powerups/BubbleSheild';

export class SheildWaterMonitor extends Monitor
{
	onRendered(event)
	{
		super.onRendered(event);

		this.box.attr({'data-monitor':'sheild-water'});
	}

	effect(other)
	{
		if(!other.controllable)
		{
			return;
		}

		const sheild = new BubbleSheild;

		other.powerups.add(sheild);
		other.inventory.add(sheild);
	}
}
