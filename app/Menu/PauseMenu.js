import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';

import { Menu } from './Menu';
import { SettingsMenu } from './SettingsMenu';
// import { SaveMenu } from './SaveMenu';
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
				, revert: () => parent.args.audio = true
				, watch: [parent.args, 'audio', v => !v]
				, set: value => parent.args.audio = !value
				// , get: () => !parent.args.audio
			}
			, Settings: SettingsMenu(parent)
			, Graphics: {
				input: 'select'
				, options: ['High', 'Medium', 'Low', 'Very Low']
				, set: value => parent.settings.graphicsLevel = value
				, get: ()    => parent.settings.graphicsLevel
			}
			// , Save: SaveMenu(parent)
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

			, Quit: {
				subtext: 'Quit to the title screen.'
				, children: {
					'No': { callback: () => this.args.items.back.callback() }
					, 'Yes': { callback: () => {
						this.args.items.back.callback();
						parent.clearCheckpoints();
						parent.unpauseGame();
						parent.quit();
						// parent.playCards();
					}}
				}
			}
		};
	}

	run(item, event)
	{
		event.stopPropagation();
		event.stopImmediatePropagation();

		super.run(item, event);
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

		const pauseButton = 9;

		if(!this.args.hideMenu)
		{
			super.input(controller);
		}
		else if(controller.buttons[pauseButton] && controller.buttons[pauseButton].active)
		{
			this.args.hideMenu = '';
		}

		if(controller.buttons[1012] && controller.buttons[1012].time > 0)
		{
			this.parent.focus();
			this.args.hideMenu = 'pause-menu-hide';
		}
		else if(controller.buttons[1020] && controller.buttons[1020].time > 0)
		{
			this.args.hideMenu = '';
		}
	}

	reset()
	{
		// this.args.items = {};
		// Object.assign(this.args.items, this.items);
		this.args.items = this.items;
		this.args.classes = '';
	}
}
