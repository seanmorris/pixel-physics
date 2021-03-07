import { Card } from './Card';

export class LoadingCard extends Card
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'loading-card';
	}
}
