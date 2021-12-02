import { Backdrop } from './Backdrop';

export class Moon extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'moon';

		this.args.strips = [
			{
				autoscroll:  0
				, parallax:  0.019
				, url:       '/Sonic/backdrop/doomsday/backdrop-inverted-0-0a.png'
				, height:    13
			}
			, {
				autoscroll:  0
				, parallax:  0.016
				, url:       '/Sonic/backdrop/doomsday/backdrop-inverted-0-0b.png'
				, height:    13
			}
			, {
				autoscroll:  0
				, parallax:  0.015
				, url:       '/Sonic/backdrop/doomsday/backdrop-inverted-0-1.png'
				, height:    12
			}
			, {
				autoscroll:  0
				, parallax:  0.013
				, url:       '/Sonic/backdrop/doomsday/backdrop-inverted-0-2.png'
				, height:    12
			}
			, {
				autoscroll:  0
				, parallax:  0.010
				, url:       '/Sonic/backdrop/doomsday/backdrop-inverted-0-3.png'
				, height:    8
			}
			, {
				autoscroll:  0
				, parallax:  0.009
				, url:       '/Sonic/backdrop/doomsday/backdrop-inverted-0-4.png  '
				, height:    5
			}
			, {
				autoscroll:  0
				, parallax:  0.007
				, url:       '/Sonic/backdrop/doomsday/backdrop-inverted-0-5.png'
				, height:    14
			}
			, {
				autoscroll:  0
				, parallax:  0.005
				, url:       '/Sonic/backdrop/doomsday/backdrop-inverted-0-6.png'
				, height:    140
			}
			, {
				autoscroll:  0
				, parallax:  0.015
				, url:       '/mmpr/moon/terrain-00-00.png'
				, height:    0
			}
			, {
				autoscroll:  0
				, parallax:  0.035
				, url:       '/mmpr/moon/terrain-00-01.png'
				, height:    2
			}
			, {
				autoscroll:  0
				, parallax:  0.045
				, url:       '/mmpr/moon/terrain-00-02.png'
				, height:    3
			}
			, {
				autoscroll:  0
				, parallax:  0.055
				, url:       '/mmpr/moon/terrain-00-03.png'
				, height:    4
			}
			, {
				autoscroll:  0
				, parallax:  0.065
				, url:       '/mmpr/moon/terrain-00-04.png'
				, height:    4
			}
			, {
				autoscroll:  0
				, parallax:  0.075
				, url:       '/mmpr/moon/terrain-00-05.png'
				, height:    10
			}
			, {
				autoscroll:  0
				, parallax:  0.085
				, url:       '/mmpr/moon/terrain-00-06.png'
				, height:    5
			}
			, {
				autoscroll:  0
				, parallax:  0.095
				, url:       '/mmpr/moon/terrain-00-07-b.png'
				, height:    10
			}
			, {
				autoscroll:  0
				, parallax:  0.1
				, url:       '/mmpr/moon/terrain-00-08.png'
				, height:    10
			}
			, {
				autoscroll:  0
				, parallax:  0.105
				, url:       '/mmpr/moon/terrain-00-09.png'
				, height:    12
			}
			, {
				autoscroll:  0
				, parallax:  0.115
				, url:       '/mmpr/moon/terrain-00-10-b.png'
				, height:    12
			}

			, {
				autoscroll:  0
				, parallax:  0.125
				, url:       '/mmpr/moon/terrain-00-11.png'
				, height:    5
			}
			, {
				autoscroll:  0
				, parallax:  0.1325
				, url:       '/mmpr/moon/terrain-00-09-b.png'
				, height:    12
			}
			// , {
			// 	autoscroll:  0
			// 	, parallax:  0.145
			// 	, url:       '/mmpr/moon/terrain-00-10.png'
			// 	, height:    12
			// }
			, {
				autoscroll:  0
				, parallax:  0.1435
				, url:       '/mmpr/moon/terrain-00-12.png'
				, height:    22
			}
		];
	}
}
