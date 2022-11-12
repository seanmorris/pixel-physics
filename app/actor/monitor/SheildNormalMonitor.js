import { Monitor } from '../Monitor';

import { NormalSheild } from '../../powerups/NormalSheild';

export class SheildNormalMonitor extends Monitor
{
	name = 'Shield Monitor';

	onRendered(event)
	{
		super.onRendered(event);

		this.box && this.box.attr({'data-monitor':'sheild-normal'});
	}

	effect(other)
	{
		if(!other.controllable)
		{
			return;
		}

		const sheild = new NormalSheild;

		other.inventory.add(sheild);
	}
}
