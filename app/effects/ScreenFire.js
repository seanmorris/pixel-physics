import { View } from 'curvature/base/View';

export class ScreenFire extends View
{
	template = require('./screen-fire');

	onAttach(event)
	{
		this.args.animation = 'playing';
	}
}
