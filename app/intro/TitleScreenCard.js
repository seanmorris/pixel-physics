import { Card } from './Card';

export class TitleScreenCard extends Card
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'title-screen-card';
		this.args.text     = '';
	}
}
