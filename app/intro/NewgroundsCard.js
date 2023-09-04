import { SkippableCard } from './SkippableCard';

export class NewgroundsCard extends SkippableCard
{
	template = require('./newgrounds-card.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.timeout = 2500;

		this.args.cardName = 'newgrounds-card';
		this.args.text     = ``;
	}
}
