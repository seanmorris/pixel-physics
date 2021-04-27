import { Card } from './Card';

export class DebianCard extends Card
{
	template = require('./debian-card.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'debian-card';
		this.args.text     = ``;
	}
}
