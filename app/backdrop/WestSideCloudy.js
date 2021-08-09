import { Backdrop } from './Backdrop';

export class WestSideCloudy extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'west-side-cloudy';

		this.args.strips = [
			{
				autoscroll: 0.1
				, parallax: 0.015
				, url:      '/Sonic/backdrop/west-side/clouds-0.png'
				, height:   33
			}
			, {
				autoscroll: 0.09
				, parallax: 0.014
				, url:      '/Sonic/backdrop/west-side/clouds-1.png'
				, height:   32
			}
			, {
				autoscroll: 0.08
				, parallax: 0.013
				, url:      '/Sonic/backdrop/west-side/clouds-2.png'
				, height:   24
			}
			, {
				autoscroll: 0.07
				, parallax: 0.012
				, url:      '/Sonic/backdrop/west-side/clouds-3.png'
				, height:   16
			}
			, {
				autoscroll: 0.06
				, parallax: 0.011
				, url:      '/Sonic/backdrop/west-side/clouds-4.png'
				, height:   5
			}
			, {
				autoscroll: 0.05
				, parallax: 0.010
				, url:      '/Sonic/backdrop/west-side/clouds-5.png'
				, height:   3
			}
			, {
				autoscroll: 0.04
				, parallax: 0.009
				, url:      '/Sonic/backdrop/west-side/clouds-6.png'
				, height:   8
			}
			, {
				autoscroll: 0.03
				, parallax: 0.008
				, url:      '/Sonic/backdrop/west-side/clouds-7.png'
				, height:   5
			}
			, {
				autoscroll: 0.04
				, parallax: 0.007
				, url:      '/Sonic/backdrop/west-side/clouds-8.png'
				, height:   3
			}
			, {
				autoscroll: 0.03
				, parallax: 0.006
				, url:      '/Sonic/backdrop/west-side/clouds-9.png'
				, height:   8
			}
			, {
				autoscroll: 0.02
				, parallax: 0.005
				, url:      '/Sonic/backdrop/west-side/clouds-10.png'
				, height:   8
			}
			, {
				autoscroll: 0.01
				, parallax: 0.004
				, url:      '/Sonic/backdrop/west-side/clouds-11.png'
				, height:   32
			}
			, {
				autoscroll: 0.0075
				, parallax: 0.003
				, url:      '/Sonic/backdrop/west-side/clouds-12.png'
				, height:   8
			}
			, {
				autoscroll: 0.005
				, parallax: 0.002
				, url:      '/Sonic/backdrop/west-side/clouds-13.png'
				, height:   32
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/water-shine-cloudy.png'
				, height:   2
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/island-dark-cloudy.png'
				, height:   0
			}
			, {
				autoscroll: 0.005
				, parallax: 0.002
				, url:      '/Sonic/backdrop/west-side/reflected-clouds-0.png'
				, height:   32
			}
			, {
				autoscroll: 0.0075
				, parallax: 0.003
				, url:      '/Sonic/backdrop/west-side/reflected-clouds-1.png'
				, height:   8
			}
			, {
				autoscroll: 0.01
				, parallax: 0.004
				, url:      '/Sonic/backdrop/west-side/reflected-clouds-2.png'
				, height:   32
			}
			, {
				autoscroll: 0.02
				, parallax: 0
				, url:      '/Sonic/backdrop/west-side/reflected-clouds-3.png'
				, height:   8
			}
			, {
				autoscroll: 0
				, parallax: 0.03
				, url:      '/Sonic/backdrop/west-side/reflected-clouds-4.png'
				, height:   8
			}
			, {
				autoscroll: 0
				, parallax: 0.04
				, url:      '/Sonic/backdrop/west-side/reflected-clouds-5.png'
				, height:   3
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/west-side/reflected-clouds-6.png'
				, height:   5
			}
			, {
				autoscroll: 0
				, parallax: 0.06
				, url:      '/Sonic/backdrop/west-side/reflected-clouds-7.png'
				, height:   16
			}
			, {
				autoscroll: 0
				, parallax: 0.07
				, url:      '/Sonic/backdrop/west-side/reflected-clouds-8.png'
				, height:   24
			}
			, {
				autoscroll: 0.01
				, parallax: 0.08
				, url:      '/Sonic/backdrop/west-side/reflected-clouds-9.png'
				, height:   20
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/island-dark-cloudy-reflected.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.004
				, url:      '/Sonic/backdrop/west-side/water-cloudy.png'
				, height:   0
			}
		];

		this.args.bindTo('frame', v => {

			if(this.args.ligtening)
			{
				return;
			}

			if(Math.random() > 0.995)
			{
				this.args.name = 'west-side-cloudy lightning';
				this.args.lightning = true;

				this.onTimeout(1000, () => {
					this.args.name = 'west-side-cloudy';
					this.args.lightning = false;
				});
			}

		});
	}
}