import { Backdrop } from './Backdrop';

// d6ffe0
// fffee0

const recolor = [
	, {'e0e0e5':'afafc1'}
	, {'e0e0e5':'afafc1'}
	, {'e0e0e5':'afafc1'}
	, {'e0e0e5':'afafc1'}
	, {'e0e0e5':'afafc1'}
	, {'e0e0e5':'e0e0e5'}
	, {'e0e0e5':'afafc1'}
	, {'e0e0e5':'e0e0e5'}
	, {'e0e0e5':'e0e0e5'}
];

export class WestSideDay extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'west-side-day';

		this.args.strips = [
			{
				autoscroll: 0.001
				, parallax: 0.001
				, url:      '/Sonic/backdrop/west-side/empty.png'
				, height:   64
			}
			, {
				autoscroll: 0.001
				, parallax: 0.001
				, url:      '/Sonic/backdrop/west-side/empty.png'
				, height:   205
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/island-day.png'
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
				, url:      '/Sonic/backdrop/west-side/water.png'
				, height:   144
			}
			, {
				autoscroll: 0
				, parallax: 0
				, url:      '/Sonic/backdrop/west-side/empty.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/island-day-reflected.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/island-shine.png'
				, height:   1
				, interval: 26
				, timeout:  100
				, frame:    0
				, recolor
			}
			, {
				autoscroll: 0
				, parallax: 0.03
				, url:      '/Sonic/backdrop/launch-base/bushes-0.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/launch-base/bushes-1.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/launch-base/bushes-2.png'
				, height:   48
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/launch-base/bushes-3.png'
				, height:   128
			}
		];
	}
}
