import { Monitor } from '../Monitor';

export class RingMonitor extends Monitor
{
	onRendered(event)
	{
		super.onRendered(event);

		this.box.attr({'data-monitor':'ring'});

		this.ringSample = new Audio('/Sonic/ring-collect.wav');
		this.ringSample.volume = 0.15 + (Math.random() * -0.05);
	}

	effect(other)
	{
		other.args.rings += 10;

		this.ringSample && this.ringSample.play();
	}
}
