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

		this.done = new Promise(accept => this.accept = accept);
	}

	play(event)
	{
		this.onTimeout(50, () => this.args.animation = 'opened');

		const waitFor = this.args.waitFor || Promise.resolve();

		return waitFor.then(() => {
			const timeAcc = this.args.timeout;

			if(timeAcc > 0)
			{
				this.onTimeout(timeAcc-500, () => this.args.animation = 'closing');
				this.onTimeout(timeAcc, () => {
					this.args.animation = 'closed';
					const done = new Promise(acceptDone => this.onTimeout(timeAcc, acceptDone));
					this.accept([done]);
				});
			}
		});
	}
}
