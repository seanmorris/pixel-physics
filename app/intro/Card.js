import { View } from 'curvature/base/View';

export class Card extends View
{
	template = require('./card.html');

	constructor(args = {}, parent)
	{
		super(args, parent);

		args.text = args.text || 'this is an intro card.';

		this.args.timeout = this.args.timeout || 1000;

		this.args.animation = 'opening';
	}

	play(event)
	{
		this.onTimeout(50, () => this.args.animation = 'opened');

		return new Promise(accept => {
			const timeAcc = this.args.timeout;

			if(timeAcc < 0)
			{
				return;
			}

			this.onTimeout(timeAcc-500, () => this.args.animation = 'closing');

			this.onTimeout(timeAcc, () => {
				this.args.animation = 'closed';
				const done = new Promise(acceptDone => this.onTimeout(timeAcc, acceptDone));
				accept([done]);
			});
		});
	}
}
