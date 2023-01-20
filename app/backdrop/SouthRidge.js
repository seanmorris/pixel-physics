import { Backdrop } from './Backdrop';

export class SouthRidge extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'south-ridge';

		this.args.strips = [
			{
				autoscroll: -0.03
				, parallax: 0.11
				, url:      '/Sonic/backdrop/south-ridge/clouds-10.png'
				, height:   10
			}
			, {
				autoscroll: 0
				, parallax: 0.1
				, url:      '/Sonic/backdrop/south-ridge/ridge.png'
				, height:   10
			}
			, {
				autoscroll: -0.06
				, parallax: 0.12
				, url:      '/Sonic/backdrop/south-ridge/clouds-9.png'
				, height:   0
			}
			, {
				autoscroll: -0.06
				, parallax: 0.12
				, url:      '/Sonic/backdrop/south-ridge/clouds-9b.png'
				, height:   8
			}
			, {
				autoscroll: -0.065
				, parallax: 0.13
				, url:      '/Sonic/backdrop/south-ridge/clouds-8.png'
				, height:   11
			}
			, {
				autoscroll: 0
				, parallax: 0.11
				, url:      '/Sonic/backdrop/south-ridge/ridge-b.png'
				, height:   20
			}
			, {
				autoscroll: -0.07
				, parallax: 0.14
				, url:      '/Sonic/backdrop/south-ridge/clouds-7.png'
				, height:   11 - 20
			}
			, {
				autoscroll: -0.075
				, parallax: 0.15
				, url:      '/Sonic/backdrop/south-ridge/clouds-6.png'
				, height:   9
			}
			, {
				autoscroll: -0.08
				, parallax: 0.16
				, url:      '/Sonic/backdrop/south-ridge/clouds-5.png'
				, height:   8
			}
			, {
				autoscroll: -0.09
				, parallax: 0.18
				, url:      '/Sonic/backdrop/south-ridge/clouds-4.png'
				, height:   16
			}
			, {
				autoscroll: -0.1
				, parallax: 0.20
				, url:      '/Sonic/backdrop/south-ridge/clouds-3.png'
				, height:   13
			}
			, {
				autoscroll: -0.1125
				, parallax: 0.22
				, url:      '/Sonic/backdrop/south-ridge/clouds-2.png'
				, height:   17
			}
			, {
				autoscroll: -0.15
				, parallax: 0.21
				, url:      '/Sonic/backdrop/south-ridge/clouds-1.png'
				, height:   15
			}
			, {
				autoscroll: -0.175
				, parallax: 0.21
				, url:      '/Sonic/backdrop/south-ridge/clouds-0.png'
				, height:   16
			}
			, {
				autoscroll: -0.15
				, parallax: 0.22
				, url:      '/Sonic/backdrop/south-ridge/clouds-1.png'
				, height:   15
			}
			, {
				autoscroll: -0.175
				, parallax: 0.23
				, url:      '/Sonic/backdrop/south-ridge/clouds-0.png'
				, height:   16
			}
		];
	}
}
