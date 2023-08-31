import { Backdrop } from './Backdrop';

export class PhazonMines extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'scrap-brain';

		this.args.strips = [
			{
				autoscroll: 0.0
				, parallax: 0.1
				, url:      '/Sonic/backdrop/tidal-tempest/phazon-mines.png'
				, height:   512
			}
		];
	}
}
