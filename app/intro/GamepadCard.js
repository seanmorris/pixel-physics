import { Card } from './Card';

export class GamepadCard extends Card
{
	template = require('./gamepad-card.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'gamepad-card';
		this.args.text     = ``;
	}
}
