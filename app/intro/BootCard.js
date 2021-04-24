import { Card } from './Card';

export class BootCard extends Card
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'boot-card';
		this.args.text     = `PRODUCED BY
SEAN MORRIS UNDER
THE APACHE 2.0 LICENSE`;
	}
}
