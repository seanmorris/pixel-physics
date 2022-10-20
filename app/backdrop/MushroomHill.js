import { Backdrop } from './Backdrop';

export class MushroomHill extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'mushroom-hill-summer';

		this.args.strips = [
			{
				autoscroll: 0
				, parallax: 0
				, url:      '/Sonic/backdrop/mushroom-hill/blank.png'
				, height:   320 + 12
			}
			, {
				autoscroll: 0
				, parallax: 0.05
				, url:      '/Sonic/backdrop/marble-garden-1/hills-recolored_1.png'
				, height:   8
			}
			, {
				autoscroll: 0
				, parallax: 0.06
				, url:      '/Sonic/backdrop/marble-garden-1/hills-recolored_2.png'
				, height:   8
			}
			, {
				autoscroll: 0
				, parallax: 0.07
				, url:      '/Sonic/backdrop/marble-garden-1/hills-recolored_3.png'
				, height:   8
			}
			, {
				autoscroll: 0
				, parallax: 0.08
				, url:      '/Sonic/backdrop/marble-garden-1/hills-recolored_4.png'
				, height:   24
			}
			, {
				autoscroll: 0
				, parallax: 0.09
				, url:      '/Sonic/backdrop/marble-garden-1/hills-recolored_5.png'
				, height:   120
			}
			// , {
			// 	autoscroll: 0
			// 	, parallax: 0.10
			// 	, url:      '/Sonic/backdrop/mushroom-hill/background-hills-summer.png'
			// 	, height:   10 + -32
			// }
			, {
				autoscroll: 0
				, parallax: 0.11
				, url:      '/Sonic/backdrop/mushroom-hill/background-trees-summer-edit.png'
				, height:   0
			}
			, {
				autoscroll: 0
				, parallax: 0.165
				, url:      '/Sonic/backdrop/mushroom-hill/foreground-summer.png'
				, height:   224
			}
		];
	}
}
