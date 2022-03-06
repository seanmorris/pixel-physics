import { Card } from './Card';
import { Bgm } from '../audio/Bgm';

import { CharacterString } from '../ui/CharacterString';

export class NoWayCard extends Card
{
	template = require('./no-way.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'no-way-card';
		this.args.text     = new CharacterString({value: 'Error: ' + this.args.errorString});
		this.args.backdrop = '...';
	}

	onAttached()
	{
		Bgm.play('NO_WAY', true);
	}
}
