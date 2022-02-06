import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';

import { Menu } from './Menu';
import { SettingsMenu } from './SettingsMenu';
import { CharacterString } from '../ui/CharacterString';


export class PauseMenu extends Menu
{
	template = require('./pause-menu.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.cardName  = 'pause-menu';
		this.args.animation = '';

		this.args.title = new CharacterString({
			value:  'Sonic 3000'
			, font: 'small-menu-font'
		});

		this.args.items = {
			Continue: { callback: () => parent.unpauseGame() }
			, Reset:    {
				children: {
					'Last Checkpoint': {
						subtext: 'Restart and record your run.'
						, callback: () => {
							parent.unpauseGame();
							parent.reset();
							parent.startLevel();
						}
					}
					, 'Level Start': {
						subtext: 'Restart and record your run.'
						, callback: () => {
							parent.clearCheckpoints();
							parent.unpauseGame();
							parent.reset();
							parent.startLevel();
						}
					}
				}
			}
			, Demos:    {
				children: {
					record: {
						callback: () => this.parent.record()
						, subtext: 'Restart and record your run.'
					}
					, stop: {
						callback: () => this.parent.stop()
						, subtext: 'Replay your run.'
					}
					, replay: {
						callback: () => this.parent.playback()
						, subtext: 'Replay your run.'
					}
				}
			}
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
		if(controller.buttons[1012] && controller.buttons[1012].active)
		{
			this.args.hideMenu = 'pause-menu-hide';
		}
		else
		{
			this.args.hideMenu = '';
		}

		if(controller.buttons[1011] && controller.buttons[1011].time === 1)
		{
			this.args.hideMenu = 'pause-menu-hide';
			this.parent.args.paused = 1;
			this.parent.focus();
		}

		super.input(controller);
	}
}
