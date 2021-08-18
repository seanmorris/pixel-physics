import { Card } from './Card';

import { CharacterString } from '../ui/CharacterString';

export class ThankYouCard extends Card
{
	template = require('./thank-you.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'thank-you-card';
		this.args.text     = new CharacterString({value: 'Thank you for playing!'});
		this.args.backdrop = '...';
	}
}
