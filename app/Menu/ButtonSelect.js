import { View } from 'curvature/base/View';
import { CharacterString } from '../ui/CharacterString';

export class ButtonSelect extends View
{
	template = '<div class = "button-select">[[prompt]] [[_button]] <button cv-on = "click:remove">exit</button></div>';
	// buttons  = ['⓿', '❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽', '❾', '❿', '⓫', '↑', '↓', '←', '→'];
	buttons  = ['⓿', '❶', '❷', '❸', '❹', '❺', '❽', '❾', '❽', '❿', '⓫', null, '↑', '↓', '←', '→'];

	onRendered(event)
	{
		this.args.prompt = new CharacterString({
			value:  'Select a button!'
			, font: 'small-menu-font'
		});

		this.args._button = new CharacterString({
			value:  ''
			, font: 'small-menu-font'
		});
	}

	input(controller)
	{
		for(const b in controller.buttons)
		{
			if(b > 100)
			{
				continue;
			}

			const button = controller.buttons[b];

			if(!button.pressure)
			{
				continue;
			}

			this.args._button.args.value = this.buttons[b];

			this.args.button = b;
		}
	}
}
