import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';

import { Menu } from './Menu';
import { SettingsMenu } from './SettingsMenu';
import { SaveMenu } from './SaveMenu';
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

		this.args.bindTo('hideMenu', v => v && (this.args.items = this.items));

		this.items = this.args.items = {
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
			// , Save: SaveMenu(parent)
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

	run(event, item)
	{
		event.stopPropagation();
		event.stopImmediatePropagation();

		super.run(item);
	}

	input(controller)
	{
		if(!this.args.hideMenu)
		{
			super.input(controller);
		}
		else if(controller.buttons[9] && controller.buttons[9].active)
		{
			this.args.hideMenu = '';
		}

		if(controller.buttons[1011] && controller.buttons[1011].time > 0)
		{
			const time = controller.buttons[1011].time;

			if(time === 1 || time > 30 && time % 15 === 1)
			{
				this.parent.focus();
				this.parent.args.paused = 1;
				this.args.hideMenu = 'pause-menu-hide';
			}
		}
		else if(controller.buttons[1012] && controller.buttons[1012].time > 0)
		{
			this.args.hideMenu = 'pause-menu-hide';
		}
		else if(controller.buttons[1012] && controller.buttons[1012].time < 0)
		{
			this.args.hideMenu = '';
		}
	}
}
