import { View } from 'curvature/base/View';

const Accept = Symbol('Accept');

export class Titlecard extends View
{
	template = require('./titlecard.html');

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.firstLine  = args.firstLine  || 'First Line';
		this.args.secondLine = args.secondLine || 'Second Line';
		this.args.creditLine = args.creditLine || 'Credit Line';
		this.args.actNumber  = args.actNumber  || 1;

		this.args.animation  = 'start';

		this.played = new Promise(accept => this[Accept] = accept);
	}

	play(event)
	{
		if(this.playing)
		{
			return this.playing;
		}

		const playing = new Promise(accept => {

			const waitFor = this.args.waitFor || Promise.resolve();

			let timeAcc = 750;

			this.onTimeout(timeAcc, () => this.onNextFrame( () =>
				this.args.animation = ''
			));

			timeAcc += 750;

			this.onTimeout(timeAcc, () => this.onNextFrame( () =>
				this.args.animation = 'opening'
			));

			timeAcc += 500;


			waitFor.finally(() => {
				this.onTimeout(timeAcc, () => this.onNextFrame( () =>
					this.args.animation = 'opening2'
				));

				timeAcc += 750;

				this.onTimeout(timeAcc, () => this.onNextFrame( () =>
					this.args.animation = 'closing'
				));

				this.onTimeout(timeAcc, () => {
					accept([ new Promise(acceptDone => this.onTimeout(timeAcc + 500, acceptDone)) ]);
					this[Accept]();
				});

				timeAcc += 1000;

				this.onTimeout(timeAcc, () => this.onNextFrame( () =>
					this.args.animation = 'closed'
				));

				timeAcc += 2500;

				this.onTimeout(timeAcc, () => this.onNextFrame( () =>{
					this.args.animation = 'done'

					this.playing = false;
				}));
			});
		});

		this.playing = playing;

		// return playing;
	}
}

