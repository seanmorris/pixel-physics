import { Monitor } from '../Monitor';

import { BubbleSheild } from '../../powerups/BubbleSheild';

export class SheildWaterMonitor extends Monitor
{
	name = 'Bubble Monitor';

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

		other.inventory.add(sheild);
	}
}
