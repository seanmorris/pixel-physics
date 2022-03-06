import { Card } from './Card';

export class WarningCard extends Card
{
	template = require('./warning-card.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'warning-card';
		this.args.text     = ``;
	}
}
