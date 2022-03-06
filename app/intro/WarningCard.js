import { SkippableCard } from './SkippableCard';

export class WarningCard extends SkippableCard
{
	template = require('./warning-card.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'warning-card';
		this.args.text     = ``;
	}
}
