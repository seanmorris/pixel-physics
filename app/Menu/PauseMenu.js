import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';

import { Menu } from './Menu';

export class PauseMenu extends Menu
{
	template = require('./pause-menu.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.cardName  = 'pause-menu';
		this.args.animation = '';

		this.args.items = {
			'Continue': { callback: () => parent.args.paused = false }
			, 'Quit': { available: 'unavailable' }
		};
	}
}
