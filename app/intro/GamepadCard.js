import { SkippableCard } from './SkippableCard';

export class GamepadCard extends SkippableCard
{
	template = require('./gamepad-card.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'gamepad-card';
		this.args.text     = ``;
	}
}
