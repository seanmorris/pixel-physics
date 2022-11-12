import { Monitor } from '../Monitor';
import { Sfx } from '../../audio/Sfx';

export class TripleRingMonitor extends Monitor
{
	name = 'Triple Ring Monitor';

	onRendered(event)
	{
		super.onRendered(event);

		this.box.attr({'data-monitor':'triple-ring'});
	}

	effect(other)
	{
		other.args.rings += 30;

		this.viewport.onFrameOut(6, () => Sfx.play('RING_COLLECTED'));
		this.viewport.onFrameOut(18, () => Sfx.play('RING_COLLECTED'));
		this.viewport.onFrameOut(32, () => Sfx.play('RING_COLLECTED'));
	}
}
