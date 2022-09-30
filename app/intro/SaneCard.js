import { SkippableCard } from './SkippableCard';

export class SaneCard extends SkippableCard
{
	template = require('./sane-card.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'sane-card';
		this.args.text     = ``;
	}
}
