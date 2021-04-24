import { Card } from './Card';

import { LogoSplash } from './LogoSplash';

export class SeanCard extends Card
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'sean-card';
		this.args.text     = new LogoSplash({}, parent);
	}
}
