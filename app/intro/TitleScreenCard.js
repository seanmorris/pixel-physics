import { Card } from './Card';

import { CharacterString } from '../ui/CharacterString';

import { MarbleGarden as Backdrop } from '../backdrop/MarbleGarden';

import { Keyboard } from 'curvature/input/Keyboard';

export class TitleScreenCard extends Card
{
	template = require('./titlescreen.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.cardName = 'title-screen-card';
		this.args.text     = '';
		this.args.backdrop = '...';

		this.startPressed = false;

		const backdrop = new Backdrop;

		backdrop.args.frame = 0;

		backdrop.args.x    = 0;
		backdrop.args.y    = 140;
		backdrop.args.xMax = 10000;
		backdrop.args.yMax = 800;

		this.started = 0;

		const keyBinding = Keyboard.get().codes.bindTo('Enter', v => {
			if(!this.started || Date.now() - this.started < 2000)
			{
				return;
			}

			this.onTimeout(500, () => this.startPressed = true);

			this.args.animation = 'closing'
		});

		this.onRemove(keyBinding);


		this.start = new Promise(accept => {
			this.onFrame(()=>{

				if(!this.started || Date.now() - this.started < 0)
				{
					return;
				}

				backdrop.args.x -= 24;
				backdrop.args.frame++;

				if(this.startPressed)
				{
					const done = new Promise(acceptDone => this.onTimeout(200, acceptDone));

					accept([done]);
				}
			});
		});

		this.args.backdrop = backdrop;

		this.args.pressStart = new CharacterString({value: 'press start/enter'});
	}

	input(controller)
	{
		if(!this.started || Date.now() - this.started < 2000)
		{
			return;
		}

		if(controller.buttons[9] && controller.buttons[9].time === 1)
		{
			this.onTimeout(500, () => this.startPressed = true);

			this.args.animation = 'closing'
		}
	}

	play()
	{
		this.onTimeout(1300, () => this.args.aurora = 'aurora');

		this.started = Date.now();

		const play = super.play();

		return Promise.any([this.start, play]);
	}
}
