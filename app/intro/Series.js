import { View } from 'curvature/base/View';

import { Card } from './Card';

export class Series extends View
{
	template = `<div class = "intro-cards" cv-each = "cards:card:c">[[card]]</div>`

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.cards = args.cards;
		this.args.cards = [];
		this.args.card = null;
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

		if(card && card.input)
		{
			card.input(controller);
		}
	}
}
