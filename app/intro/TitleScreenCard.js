import { Card } from './Card';

import { CharacterString } from '../ui/CharacterString';
import { Bgm } from '../audio/Bgm';

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

		// this.bgm = new Audio('/Sonic/carnival-night-zone-act-2-beta.mp3');
		// this.bgm.volume = 0.5;

		// this.onRemove(() => this.bgm.pause());

		const keyBinding = Keyboard.get().codes.bindTo('Enter', v => {
			if(!this.started || Date.now() - this.started < 2000)
			{
				return;
			}

			this.onTimeout(200, () => this.startPressed = true);

			this.args.animation = 'closing';

			// this.audioDebind();
		});

		this.onRemove(keyBinding);

		backdrop.args.xPan = 0;

		this.start = new Promise(accept => {
			this.onFrame(()=>{

				if(!this.started || Date.now() - this.started < 0)
				{
					return;
				}

				// backdrop.args.x -= 24;
				backdrop.args.xPan -= 24;
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
			controller.zero();
			return;
		}

		if(controller.buttons[9] && controller.buttons[9].time === 1)
		{
			this.onTimeout(200, () => this.startPressed = true);

			this.args.animation = 'closing';

			// this.audioDebind();
		}
	}

	play()
	{
		this.onTimeout(1000, () => {
			// this.audioDebind = this.parent.args.bindTo('audio', (v) => {
			// 	v ? this.bgm.play() : this.bgm.pause();
			// });

			this.onRemove(()=>Bgm.stop('TITLE_THEME'));

			Bgm.play('TITLE_THEME');
		});

		this.onTimeout(2000, () => this.args.aurora = 'aurora');

		this.started = Date.now();

		const play = super.play();

		// play.then(()=>{ this.bgm.pause(); this.audioDebind(); this.remove(); });

		return Promise.race([this.start, play]);
	}
}
