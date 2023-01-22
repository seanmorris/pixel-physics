import { Backdrop } from './Backdrop';

export class ScrapBrainDark extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'scrap-brain';

		this.args.strips = [
			{
				autoscroll: 0.0
				, parallax: 0.1
				, url:      '/Sonic/backdrop/scrap-brain/indoors-dark.png'
				, height:   1024
			}
		];
	}
}
