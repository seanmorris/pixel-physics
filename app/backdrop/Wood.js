import { Backdrop } from './Backdrop';

export class Wood extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'wood';

		this.args.strips = [
			{
				autoscroll: 0.0
				, parallax: 0.1
				, url:      '/Sonic/backdrop/wood/forest.png'
				, height:   1600
			}
		];
	}
}
