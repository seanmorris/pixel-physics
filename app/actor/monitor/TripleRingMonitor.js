import { Monitor } from '../Monitor';
import { Sfx } from '../../audio/Sfx';

export class TripleRingMonitor extends Monitor
{
	onRendered(event)
	{
		super.onRendered(event);

		this.box.attr({'data-monitor':'triple-ring'});
	}

	effect(other)
	{
		other.args.rings += 30;

		Sfx.play('RING_COLLECTED');
		this.viewport.onFrameOut(10, () => Sfx.play('RING_COLLECTED'));
		this.viewport.onFrameOut(20, () => Sfx.play('RING_COLLECTED'));
	}
}
