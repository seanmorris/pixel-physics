import { View } from 'curvature/base/View';

export class ScreenWarp extends View
{
	template = require('./screen-fire');

	onAttach(event)
	{
		this.args.animation = 'playing'
		this.onTimeout(5000, ()=> this.remove());
	}
}
