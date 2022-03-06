import { SkippableCard } from './SkippableCard';

export class DebianCard extends SkippableCard
{
	template = require('./debian-card.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'debian-card';
		this.args.text     = ``;
	}
}
