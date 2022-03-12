import { View } from 'curvature/base/View';
import { Card } from '../intro/Card';

export class GamepadConfig extends Card
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template = require('./gamepad-config.html');

		this.args.cardName = 'gamepad-config-card';

		this.gamepads = {
			xb: View.from(require('./xbox360-input.svg'))
			, ps: View.from(require('./ps3-input.svg'))
			, gc: View.from(require('./gc-input.svg'))
		};

		this.current = 0;

		this.buttons = [];
		this.sticks  = {};
	}

	onAttached()
	{
		this.span = this.findTag('div');

		this.args.text = Object.values(this.gamepads)[this.current];
		this.args.type = Object.keys(this.gamepads)[this.current];
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
		this.parent.quit(2);
	}

	input(controller)
	{
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
}
