import { View } from 'curvature/base/View';

import { Card } from './Card';
import { Titlecard } from '../titlecard/Titlecard';

import { LoadingCard } from './LoadingCard';
import { BootCard } from './BootCard';
import { SeanCard } from './SeanCard';
import { MainMenu } from '../Menu/MainMenu.js';

import { TitleScreenCard } from './TitleScreenCard';

export class Series extends View
{
	template = `<div class = "intro-cards" cv-each = "cards:card:c">[[card]]</div>`

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.card = null;
		this.args.cards = [];

		this.cards = [

			new LoadingCard({timeout: 3500, text: 'loading'}, parent)

			// , new BootCard({timeout: 2500})

			, new SeanCard({timeout: 5000}, parent)

			, new TitleScreenCard({timeout: 50000}, parent)

			, new MainMenu({timeout: -1}, parent)

			, new Titlecard({
				firstLine:    'PIXEL HILL'
				, secondLine: 'ZONE'
				, creditLine: 'Sean Morris'
			}, parent)

		];
	}

	play()
	{
		const card = this.cards.shift();
		const play = card.play();

		this.args.cards.push(card);

		const removeEarly = new Promise(accept => card.onRemove(accept));

		return Promise.race([play, removeEarly]).then(done => {

			if(done)
			{
				Promise.all(done).then(() => card.remove());
			}

			if(this.cards.length)
			{
				return this.play();
			}
			else
			{
				return play;
			}
		});
	}

	input(controller)
	{
		const card = this.args.cards[ this.args.cards.length - 1 ];

		if(card.input)
		{
			card.input(controller);
		}
	}
}
