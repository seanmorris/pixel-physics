import { View } from 'curvature/base/View';
import { CharacterString } from '../ui/CharacterString'

export class KbInput extends View
{
	template = require('./kb-input.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.title      = new CharacterString({font: this.font, value: 'Sonic 3000'});
		this.args.dpadView   = new CharacterString({font: this.font, value: `⬲ ✚ ${this.args.dpad}`});
		this.args.aView      = new CharacterString({font: this.font, value: `⬚ ⓿ ${this.args.a}`});
		this.args.bView      = new CharacterString({font: this.font, value: `⬚ ❶ ${this.args.b}`});
		this.args.xView      = new CharacterString({font: this.font, value: `⬚ ❷ ${this.args.x}`});
		this.args.yView      = new CharacterString({font: this.font, value: `⬚ ❸ ${this.args.y}`});
		this.args.lrView     = new CharacterString({font: this.font, value: `❹ ❺ ${this.args.r1}`});
		this.args.raView     = new CharacterString({font: this.font, value: `⬚ ▦ ${this.args.ra}`});
		this.args.startView     = new CharacterString({font: this.font, value: `⬚ ❾ ${this.args.start}`});
	}
}
