import { Monitor } from '../Monitor';

import { ElectricSheild } from '../../powerups/ElectricSheild';

export class SheildElectricMonitor extends Monitor
{
	onRendered(event)
	{
		super.onRendered(event);

		this.box && this.box.attr({'data-monitor':'sheild-electric'});
	}

	effect(other)
	{
		if(!other.controllable)
		{
			return;
		}

		const sheild = new ElectricSheild;

		other.inventory.add(sheild);
	}
}
