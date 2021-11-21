import { View } from 'curvature/base/View';

import { Card } from './Card';

export class Series extends View
{
	template = `<div class = "intro-cards" cv-each = "cards:card:c">[[card]]</div>`

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.cards = this.args.cards;
		this.args.cards = [];
		this.args.card = null;

		this.startTime = false;
	}

	play()
	{
		const card  = this.cards.shift();
		const early = new Promise(accept => card.onRemove(accept));
		const play  = card.play();

		this.args.cards.push(card);

		this.startTime = Date.now();

		const racers = [early, card.done];

		if(play)
		{
			racers.push(play);
		}

		return Promise.race(racers).then(done => {
			if(done)
			{
				this.parent.onFrameOut(10, () => {
					Promise.all(done).then(() => card.remove());
				});
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
