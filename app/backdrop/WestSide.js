import { Backdrop } from './Backdrop';

export class WestSide extends Backdrop
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
				, height:   162
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/island-dark.png'
				, height:   27
			}
			, {
				autoscroll: 0
				, parallax: 0.0005
				, url:      '/Sonic/backdrop/west-side/water.png'
				, height:   128
			}
			, {
				autoscroll: 0
				, parallax: 0.001
				, url:      '/Sonic/backdrop/west-side/stars-reflected.png'
				, height:   0
			}
		];
	}
}
