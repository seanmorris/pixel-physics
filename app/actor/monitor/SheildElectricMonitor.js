import { Monitor } from '../Monitor';

import { ElectricSheild } from '../../powerups/ElectricSheild';

export class SheildElectricMonitor extends Monitor
{
	attached(event)
	{
		super.attached(event);

		this.box.attr({'data-monitor':'sheild-electric'});
	}

	effect(other)
	{
		const sheild = new ElectricSheild;

		other.powerups.add(sheild);

		sheild.render(other.sprite);
	}
}
