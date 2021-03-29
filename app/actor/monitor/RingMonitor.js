import { Monitor } from '../Monitor';

export class RingMonitor extends Monitor
{
	onRendered(event)
	{
		super.onRendered(event);

		this.box.attr({'data-monitor':'ring'});
	}

	effect(other)
	{
		other.args.rings += 10;
	}
}
