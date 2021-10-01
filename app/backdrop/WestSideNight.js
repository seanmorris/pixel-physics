import { Backdrop } from './Backdrop';

export class WestSideNight extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'west-side';

		this.args.strips = [
			{
				autoscroll: 0
				, parallax: 0.001
				, url:      '/Sonic/backdrop/west-side/stars.png'
				, height:   0
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
			, {
				autoscroll: 0
				, parallax: 0.0004
				, url:      '/Sonic/backdrop/west-side/water-shine-2.png'
				, height:   3
			}
			, {
				autoscroll: 0
				, parallax: 0.004
				, url:      '/Sonic/backdrop/west-side/water.png'
				, height:   142
			}
			, {
				autoscroll: 0
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
		];
	}
}
