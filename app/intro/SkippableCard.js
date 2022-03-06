import { Card } from './Card';

export class SkippableCard extends Card
{
	// template = require('./debian-card.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'skippable-card';
		this.args.text     = ``;
	}



	input(controller)
	{
		if(!this.started || Date.now() + -this.started < 500)
		{
			return;
		}

		if(controller.buttons[9] && controller.buttons[9].time === 1
			|| controller.buttons[0] && controller.buttons[0].time === 1
		){
			this.onTimeout(200, () => this.startPressed = true);

			this.args.animation = 'closing';
		}
	}

	play()
	{
		this.started = Date.now();

		return Promise.race([super.play(), new Promise(accept => this.onFrame(()=>{
			if(this.startPressed)
			{
				accept();
			}
		}))]);
	}
}
