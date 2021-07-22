import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';

import { Menu } from './Menu';
import { SettingsMenu } from './SettingsMenu';

export class PauseMenu extends Menu
{
	template = require('./pause-menu.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.cardName  = 'pause-menu';
		this.args.animation = '';

		this.args.items = {
			Continue: { callback: () => parent.unpauseGame() }
			, Reset: { callback: () => {
				parent.unpauseGame();
				parent.reset();
				parent.startLevel();
			} }
			, Settings: SettingsMenu(parent)
			, Quit: {
				children: {
					'No': { callback: () => this.args.items.back.callback() }
					, 'Yes': { callback: () => {
						this.args.items.back.callback();
						parent.unpauseGame();
						parent.quit();
					}}
				}
			}
		};
	}

	input(controller)
	{
		if(controller.buttons[4] && controller.buttons[4].active)
		{
			this.args.hideMenu = 'pause-menu-hide';
		}
		else
		{
			this.args.hideMenu = '';
		}

		if(controller.buttons[5] && controller.buttons[5].time === 1)
		{
			this.args.hideMenu = 'pause-menu-hide';
			this.parent.args.paused = 1;
		}

		super.input(controller);
	}
}
