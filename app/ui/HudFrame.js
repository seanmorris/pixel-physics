import { View } from 'curvature/base/View';

export class HudFrame extends View
{
	template = `<div class = "hud-frame [[alert]]">
		<div class = "hud-value">[[value]]</div>
	</div>`;

	constructor(...args)
	{
		super(...args);
	}
}
