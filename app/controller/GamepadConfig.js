import { View } from 'curvature/base/View';
import { SkippableCard } from '../intro/SkippableCard';

import { KbInput } from './KbInput';

export class GamepadConfig extends SkippableCard
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template = require('./gamepad-config.html');

		this.args.cardName = 'gamepad-config-card';

		this.args.moves = {};

		this.args.char = this.args.char || 'Sonic';

		switch(args.char)
		{
			case 'Sonic':
				this.args.moves = {
					start:  'Pause'
					, dpad: 'Move'
					, a:    'Jump'
					, b:    'Spindash / Roll / Dropdash'
					, x:    'Light Dash / Interact'
					, y:    'Super Transform'
					, l1:   'Air Dash'
					, r1:   'Air Dash'
					, la:   'Move'
					, ra:   'Switch Sheilds'
				};
				break;
			case 'Tails':
				this.args.moves = {
					start:  'Pause'
					, dpad: 'Move'
					, a:    'Jump'
					, aa:   'Fly'
					, ad:   'Use Shield / Spindash'
					, d:    'Dive'
					, x:    'Interact'
					, y:    'Super Transform'
					// , l1:   'Air Dash'
					// , r1:   'Air Dash'
					, la:   'Move'
					, ra:   'Switch Sheilds'
				};
				break;
			case 'Knuckles':
				this.args.moves = {
					start:  'Pause'
					, dpad: 'Move'
					, a:    'Jump'
					, aa:   'Fly'
					, b:    'Punch / Drop off wall'
					, ad:   'Use Shield / Spindash'
					, d:    'Dive'
					// , x:    'Interact'
					, y:    'Super Transform'
					// , l1:   'Air Dash'
					// , r1:   'Air Dash'
					, la:   'Move'
					, ra:   'Switch Sheilds'
				};
				break;
		}

		// this.gamepads = {
		// 	xb: View.from(require('./xbox360-input.svg'), this.args.moves)
		// 	, dc: View.from(require('./dc-input.svg'), this.args.moves)
		// 	, gc: View.from(require('./gc-input.svg'), this.args.moves)
		// 	, ps: View.from(require('./ps3-input.svg'), this.args.moves)
		// };

		// this.gamepads = {kb: new KbInput(this.args.moves) }

		if(this.args.inputType === 'input-xbox')
		{
			this.gamepads = {xb: View.from(require('./xbox360-input.svg'), this.args.moves)};
			this.args.type = 'xb';
		}
		else if(this.args.inputType === 'input-playstation')
		{
			this.gamepads = {ps: View.from(require('./ps3-input.svg'), this.args.moves)};
			this.args.type = 'ps';
		}
		else if(this.args.inputType === 'input-dreamcast')
		{
			this.gamepads = {ps: View.from(require('./dc-input.svg'), this.args.moves)};
			this.args.type = 'dc';
		}
		else if(this.args.inputType === 'input-gamecube')
		{
			this.gamepads = {ps: View.from(require('./gc-input.svg'), this.args.moves)};
			this.args.type = 'gc';
		}
		else
		{
			this.gamepads = {kb: new KbInput({char: this.args.char, moves: this.args.moves}) }
		}

		this.current = 0;

		this.buttons = [];
		this.sticks  = {};
	}

	onAttached()
	{
		this.span = this.findTag('div');

		this.args.text = Object.values(this.gamepads)[this.current];
		this.args.type = this.args.type || Object.keys(this.gamepads)[this.current];
	}

	swap()
	{
		this.current++;

		const list = Object.values(this.gamepads);
		const type = Object.keys(this.gamepads);

		if(this.current >= list.length)
		{
			this.current = 0;
		}

		this.args.text = list[this.current];
		this.args.type = type[this.current];
	}

	exit()
	{
		this.remove();
	}

	input(controller)
	{
		super.input(controller);

		if(!this.span)
		{
			return;
		}

		let x = 0, y = 0, a = 0, b = 0;

		if(controller.axes[0])
		{
			x = controller.axes[0].magnitude;
		}

		if(controller.axes[1])
		{
			y = controller.axes[1].magnitude;
		}

		if(controller.axes[2])
		{
			a = controller.axes[2].magnitude;
		}

		if(controller.axes[3])
		{
			b = controller.axes[3].magnitude;
		}

		this.span.style({
			'--x':   x
			, '--y': y
			, '--a': a
			, '--b': b
		});

		for(const b in controller.buttons)
		{
			if(controller.buttons[b])
			{
				this.span.style({
					[`--pressed-${b}`]: controller.buttons[b].pressure
				});
			}
			else
			{
				this.span.style({
					[`--pressed-${b}`]: 0
				});
			}
		}
	}

	play(event)
	{
		// this.onTimeout(50, () => this.args.animation = 'opened');

		// const waitFor = this.args.waitFor || Promise.resolve();

		// return new Promise(accept => {
		// 	waitFor.then(() => {
		// 		const timeAcc = this.args.timeout;

		// 		if(timeAcc > 0)
		// 		{
		// 			this.onTimeout(timeAcc-500, () => this.args.animation = 'closing');
		// 			this.onTimeout(timeAcc, () => {
		// 				this.args.animation = 'closed';
		// 				const done = new Promise(acceptDone => this.onTimeout(timeAcc, acceptDone));
		// 				accept(this.accept([done]));
		// 			});
		// 		}
		// 	});
		// });
	}
}
