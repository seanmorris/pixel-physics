import { Monitor } from '../Monitor';

export class RingMonitor extends Monitor
{
	attached(event)
	{
		super.attached(event);

		this.box.attr({'data-monitor':'ring'});
	}

	effect(other)
	{
		other.args.rings += 10;
	}
}
