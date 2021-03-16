import { Monitor } from '../Monitor';

import { BubbleSheild } from '../../powerups/BubbleSheild';

export class SheildWaterMonitor extends Monitor
{
	attached(event)
	{
		super.attached(event);

		this.box.attr({'data-monitor':'sheild-water'});
	}

	effect(other)
	{
		const sheild = new BubbleSheild;

		other.powerups.add(sheild);

		sheild.render(other.sprite);
	}
}
