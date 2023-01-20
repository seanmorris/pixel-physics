import { Backdrop } from './Backdrop';

export class WestSide extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'west-side';

		this.args.strips = [
			{
				autoscroll: 0.001
				, parallax: 0.001
				, url:      '/Sonic/backdrop/west-side/stars-before.png'
				, height:   64
			}
			, {
				autoscroll: 0.001
				, parallax: 0.001
				, url:      '/Sonic/backdrop/west-side/stars.png'
				, height:   205
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/island-dark.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/water-shine-0.png'
				, height:   3
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/water-shine-1.png'
				, height:   3
			}
			// , {
			// 	autoscroll: 0
			// 	, parallax: 0.0004
			// 	, url:      '/Sonic/backdrop/west-side/water-shine-2.png'
			// 	, height:   3
			// }
			, {
				autoscroll: 0
				, parallax: 0.004
				, url:      '/Sonic/backdrop/west-side/water-night.png'
				, height:   144
			}
			, {
				autoscroll: 0.001
				, parallax: 0.001
				, url:      '/Sonic/backdrop/west-side/stars-reflected.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/island-dark-reflected.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.03
				, url:      '/Sonic/backdrop/launch-base/bushes-0-night.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/launch-base/bushes-1-night.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/launch-base/bushes-2-night.png'
				, height:   48
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/launch-base/bushes-3-night.png'
				, height:   128
			}
		];
	}
}
