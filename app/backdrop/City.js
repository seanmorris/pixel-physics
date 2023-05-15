import { Backdrop } from './Backdrop';

export class City extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'city';

		this.args.strips = [
			{
				autoscroll: 0.0
				, parallax: 0.096
				, url:      '/bttf2/city/sky.png'
				, height:   85
			}
			, {
				autoscroll: 0.0
				, parallax: 0.064
				, url:      '/bttf2/city/sky.png'
				, height:   85
			}
			, {
				autoscroll: 0.0
				, parallax: 0.048
				, url:      '/bttf2/city/sky.png'
				, height:   85
			}
			, {
				autoscroll: 0.0
				, parallax: 0.032
				, url:      '/bttf2/city/sky.png'
				, height:   85
			}
			, {
				autoscroll: 0.0
				, parallax: 0.05
				, url:      '/bttf2/city/buildings-bg.png'
				, height:   76
			}
			, {
				autoscroll: 0.0
				, parallax: 0.1
				, url:      '/bttf2/city/bushes.png'
				, height:   144
			}
			, {
				autoscroll: 0.0
				, parallax: 0.2
				, url:      '/bttf2/city/buildings-fg-recolor.png'
				, height:   64
			}
		];
	}
}
