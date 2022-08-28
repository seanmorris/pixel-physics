import { Monitor } from '../Monitor';
import { Sfx } from '../../audio/Sfx';

export class InfoMonitor extends Monitor
{
	onRendered(event)
	{
		super.onRendered(event);

		this.box.attr({'data-monitor':'info'});
	}

	effect(other)
	{
		if(this.args.target && this.viewport.actorsById[ this.args.target ])
		{
			const target = this.viewport.actorsById[ this.args.target ];

			target.activate(other, this, true);

			other.args.xSpeed *= 0.25;
			other.dropDashCharge = 0;
		}
	}
}
