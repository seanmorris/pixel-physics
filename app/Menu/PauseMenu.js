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

		this.items = this.args.items = {
			Continue: {
				subtext: 'Return to gameplay.'
				, callback: () => parent.unpauseGame()
			}
			, Mute: {
				input: 'boolean'
				, subtext: 'Mute all audio'
				, set: value => parent.args.audio = !value
				, get: () => !parent.args.audio
			}
			, Settings: SettingsMenu(parent)
			, Reset:    {
				subtext: 'Reset the run.'
				, children: {
					'Last Checkpoint': {
						subtext: 'Restart from the last checkpoint.'
						, children: {
							'No': { callback: () => this.args.items.back.callback() }
							, 'Yes': {callback: () => {
								parent.unpauseGame();
								parent.reset();
								parent.startLevel();
							}}
						}
					}
					, 'Level Start': {
						subtext: 'Restart from the beginning of the act.'
						, children: {
							'No': { callback: () => this.args.items.back.callback() }
							, 'Yes': {callback: () => {
								parent.clearCheckpoints();
								parent.unpauseGame();
								parent.reset();
								parent.startLevel();
							}}
						}
					}
				}
			}
			// , Demos:    {
			// 	children: {
			// 		record: {
			// 			callback: () => this.parent.record()
			// 			, subtext: 'Restart and record your run.'
			// 		}
			// 		, stop: {
			// 			callback: () => this.parent.stop()
			// 			, subtext: 'Replay your run.'
			// 		}
			// 		, replay: {
			// 			callback: () => this.parent.playback()
			// 			, subtext: 'Replay your run.'
			// 		}
			// 	}
			// }
			// , Save: SaveMenu(parent)
			, Quit: {
				subtext: 'Quit to the title screen.'
				, children: {
					'No': { callback: () => this.args.items.back.callback() }
					, 'Yes': { callback: () => {
						this.args.items.back.callback();
						parent.clearCheckpoints();
						parent.unpauseGame();
						parent.quit();
						parent.playCards();
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
		if(controller.buttons[1011] && controller.buttons[1011].active)
		{
			const time = controller.buttons[1011].time;

			if(time === 1 || time > 30 && time % 15 === 1)
			{
				this.parent.focus();
				this.parent.args.paused = 1;
				this.args.hideMenu = 'pause-menu-hide';
			}
		}

		if(!this.args.hideMenu)
		{
			super.input(controller);
		}
		else if(controller.buttons[9] && controller.buttons[9].active)
		{
			this.args.hideMenu = '';
		}

		if(controller.buttons[1012] && controller.buttons[1012].time > 0)
		{
			this.parent.focus();
			this.args.hideMenu = 'pause-menu-hide';
		}
		else if(controller.buttons[1012] && controller.buttons[1012].time < 0)
		{
			this.args.hideMenu = '';
		}
	}

	reset()
	{
		this.args.items = this.items;
	}
}
