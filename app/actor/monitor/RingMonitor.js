import { Monitor } from '../Monitor';
import { Sfx } from '../../audio/Sfx';

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

		Sfx.play('RING_COLLECTED');
	}
}
