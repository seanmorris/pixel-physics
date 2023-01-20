import { Backdrop } from './Backdrop';

export class Overcast extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'overcast';

		this.args.strips = [
			{
				autoscroll: 0.14
				, parallax: 0.06
				, url:      '/Sonic/backdrop/stardust-speedway/sky-0.png'
				, height:   32
			}
			, {
				autoscroll: 0.13
				, parallax: 0.055
				, url:      '/Sonic/backdrop/stardust-speedway/sky-1.png'
				, height:   32
			}
			, {
				autoscroll: 0.12
				, parallax: 0.05
				, url:      '/Sonic/backdrop/stardust-speedway/sky-2.png'
				, height:   16
			}
			, {
				autoscroll: 0.11
				, parallax: 0.045
				, url:      '/Sonic/backdrop/stardust-speedway/sky-3.png'
				, height:   16
			}
			, {
				autoscroll: 0.10
				, parallax: 0.05
				, url:      '/Sonic/backdrop/stardust-speedway/sky-4.png'
				, height:   16
			}
			, {
				autoscroll: 0.09
				, parallax: 0.05
				, url:      '/Sonic/backdrop/stardust-speedway/sky-5.png'
				, height:   32
			}
			, {
				autoscroll: 0.08
				, parallax: 0.04
				, url:      '/Sonic/backdrop/stardust-speedway/sky-6.png'
				, height:   32
			}
			, {
				autoscroll: 0.07
				, parallax: 0.03
				, url:      '/Sonic/backdrop/stardust-speedway/sky-7.png'
				, height:   16
			}
			, {
				autoscroll: 0.06
				, parallax: 0.02
				, url:      '/Sonic/backdrop/stardust-speedway/sky-8.png'
				, height:   32
			}
			, {
				autoscroll: 0.05
				, parallax: 0.01
				, url:      '/Sonic/backdrop/stardust-speedway/sky-9.png'
				, height:   16
			}
			, {
				autoscroll: 0.04
				, parallax: 0.005
				, url:      '/Sonic/backdrop/stardust-speedway/sky-10.png'
				, height:   16
			}
			, {
				autoscroll: 0.03
				, parallax: 0.004
				, url:      '/Sonic/backdrop/stardust-speedway/sky-11.png'
				, height:   16
			}
			, {
				autoscroll: 0.02
				, parallax: 0.003
				, url:      '/Sonic/backdrop/stardust-speedway/sky-12.png'
				, height:   16
			}
			, {
				autoscroll: 0.015
				, parallax: 0.002
				, url:      '/Sonic/backdrop/stardust-speedway/sky-13.png'
				, height:   8
			}
			, {
				autoscroll: 0.015
				, parallax: 0.002
				, url:      '/Sonic/backdrop/stardust-speedway/sky-14.png'
				, height:   51
			}
			, {
				autoscroll: 0.015
				, parallax: 0.002
				, url:      '/Sonic/backdrop/west-side/empty.png'
				, height:   51
			}
		];

		// this.args.bindTo('frame', v => {

		// 	if(this.args.ligtening)
		// 	{
		// 		return;
		// 	}

		// 	if(Math.random() > 0.995)
		// 	{
		// 		this.args.name = 'dark-clouds lightning';
		// 		this.args.lightning = true;

		// 		this.onTimeout(1000, () => {
		// 			this.args.name = 'dark-clouds';
		// 			this.args.lightning = false;
		// 		});
		// 	}

		// });
	}
}
