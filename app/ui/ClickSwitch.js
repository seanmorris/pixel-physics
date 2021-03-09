import { View } from 'curvature/base/View';

export class ClickSwitch extends View
{
	template = require('./click-switch.html');

	toggle()
	{
		this.args.active = !this.args.active;
	}
}
