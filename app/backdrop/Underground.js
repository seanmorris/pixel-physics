import { Backdrop } from './Backdrop';

export class Underground extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'underground';

		this.args.strips = [
			{
				autoscroll: 0.045
				, parallax: 0.075
				, url:      '/Sonic/backdrop/wing-fortress/sky-1b-recolor.png'
				, height:   32
			}, {
				autoscroll: 0.043
				, parallax: 0.070
				, url:      '/Sonic/backdrop/wing-fortress/sky-0-recolor.png'
				, height:   48
			}
			, {
				autoscroll: 0.041
				, parallax: 0.065
				, url:      '/Sonic/backdrop/wing-fortress/sky-1-recolor.png'
				, height:   32
			}
			, {
				autoscroll: 0.039
				, parallax: 0.060
				, url:      '/Sonic/backdrop/wing-fortress/sky-2-recolor.png'
				, height:   48
			}
			, {
				autoscroll: 0
				, parallax: 0.075
				, url:      '/Sonic/backdrop/aquatic-ruin/mountains-0-recolor.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0
				, url:      '/Sonic/backdrop/aquatic-ruin/mountains-1-recolor.png'
				, height:   48
			}
			, {
				autoscroll: 0
				, parallax: 0
				, url:      '/Sonic/backdrop/aquatic-ruin/mountains-1-recolor.png'
				, height:   48
			}
			, {
				autoscroll: 0
				, parallax: 0
				, url:      '/Sonic/backdrop/aquatic-ruin/mountains-1-recolor.png'
				, height:   24
			}
		];
	}
}
