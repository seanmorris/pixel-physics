import { Backdrop } from './Backdrop';

export class AngelIsland extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'angel-island';

		this.args.strips = [
			{
				autoscroll: -0.080
				, parallax: 0.005
				, url:      '/Sonic/backdrop/angel-island/sky-0.png'
				, height:   196
			}
			, {
				autoscroll: 0.000
				, parallax: 0.007
				, url:      '/Sonic/backdrop/angel-island/sky-1.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.009
				, url:      '/Sonic/backdrop/angel-island/sky-2.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.012
				, url:      '/Sonic/backdrop/angel-island/sky-3.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.015
				, url:      '/Sonic/backdrop/angel-island/sky-4.png'
				, height:   16
			}
			, {
				autoscroll: 0.000
				, parallax: 0.021
				, url:      '/Sonic/backdrop/angel-island/sky-5.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.025
				, url:      '/Sonic/backdrop/angel-island/sky-6.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.028
				, url:      '/Sonic/backdrop/angel-island/sky-7.png'
				, height:   16
			}
			, {
				autoscroll: 0.000
				, parallax: 0.031
				, url:      '/Sonic/backdrop/angel-island/sky-8.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.035
				, url:      '/Sonic/backdrop/angel-island/sky-9.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.040
				, url:      '/Sonic/backdrop/angel-island/sky-10.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.044
				, url:      '/Sonic/backdrop/angel-island/sky-11.png'
				, height:   16
			}
			, {
				autoscroll: 0.000
				, parallax: 0.048
				, url:      '/Sonic/backdrop/angel-island/sky-12.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.05
				, url:      '/Sonic/backdrop/angel-island/sky-13.png'
				, height:   7
			}
			, {
				autoscroll: 0.000
				, parallax: 0.055
				, url:      '/Sonic/backdrop/angel-island/sky-14.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.060
				, url:      '/Sonic/backdrop/angel-island/sky-15.png'
				, height:   8
			}
			, {
				autoscroll: 0.000
				, parallax: 0.066
				, url:      '/Sonic/backdrop/angel-island/sky-16.png'
				, height:   6
			}
			, {
				autoscroll: 0.000
				, parallax: 0.072
				, url:      '/Sonic/backdrop/angel-island/sky-17.png'
				, height:   10
			}
			// , {
			// 	autoscroll: 0.000
			// 	, parallax: 0.072
			// 	, url:      '/Sonic/backdrop/angel-island/water-0.png'
			// 	, height:   96
			// }
		];
	}
}
