import { HtmlFrame } from '../HtmlFrame';
import { Monitor } from '../Monitor';

export class WebMonitor extends Monitor
{
	onRendered(event)
	{
		super.onRendered(event);

		this.box.attr({'data-monitor':'web-monitor'});
	}

	effect(other)
	{
		const frame = new HtmlFrame({
			x:this.x
			, y:this.y
			, width: 240
			, height: 180
		});

		this.viewport.spawn.add({object: frame})
	}
}
