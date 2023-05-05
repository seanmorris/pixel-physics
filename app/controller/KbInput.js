import { View } from 'curvature/base/View';
import { CharacterString } from '../ui/CharacterString'

export class KbInput extends View
{
	template = require('./kb-input.html');

	constructor(args, parent)
	{
		super(args, parent);

		switch(this.args.char)
		{
			case 'Sonic':
				this.args.lines = [
					new CharacterString({font: this.font, value: `⬲ ✚ ${this.args.moves.dpad}`})
					, new CharacterString({font: this.font, value: `⬚ ⓿ ${this.args.moves.a}`})
					, new CharacterString({font: this.font, value: `⬚ ❶ ${this.args.moves.b}`})
					, new CharacterString({font: this.font, value: `⬚ ❷ ${this.args.moves.x}`})
					, new CharacterString({font: this.font, value: `⬚ ❸ ${this.args.moves.y}`})
					, new CharacterString({font: this.font, value: `❹ ❺ ${this.args.moves.r1}`})
					, new CharacterString({font: this.font, value: `⬚ ▦ ${this.args.moves.ra}`})
					, new CharacterString({font: this.font, value: `⬚ ❾ ${this.args.moves.start}`})
				];
				break;

			case 'Tails':
				this.args.lines = [
					new CharacterString({font: this.font, value: `⬲ ✚ ${this.args.moves.dpad}`})
					, new CharacterString({font: this.font, value: `⬚ ⓿ ${this.args.moves.a}`})
					, new CharacterString({font: this.font, value: `⓿ ⓿ ${this.args.moves.aa}`})
					, new CharacterString({font: this.font, value: `↓ ⓿ ${this.args.moves.ad}`})
					, new CharacterString({font: this.font, value: `↓ ⬚ ${this.args.moves.d}`})
					// , new CharacterString({font: this.font, value: `⬚ ❶ ${this.args.moves.b}`})
					// , new CharacterString({font: this.font, value: `⬚ ❷ ${this.args.moves.x}`})
					// , new CharacterString({font: this.font, value: `⬚ ❸ ${this.args.moves.y}`})
					// , new CharacterString({font: this.font, value: `❹ ❺ ${this.args.moves.r1}`})
					// , new CharacterString({font: this.font, value: `⬚ ▦ ${this.args.moves.ra}`})
					, new CharacterString({font: this.font, value: `⬚ ❾ ${this.args.moves.start}`})
				];
				break;

			case 'Knuckles':
				this.args.lines = [
					new CharacterString({font: this.font, value: `⬲ ✚ ${this.args.moves.dpad}`})
					, new CharacterString({font: this.font, value: `⬚ ⓿ ${this.args.moves.a}`})
					, new CharacterString({font: this.font, value: `⬚ ❶ ${this.args.moves.b}`})
					, new CharacterString({font: this.font, value: `⓿ ⓿ ${this.args.moves.aa}`})
					, new CharacterString({font: this.font, value: `↓ ⓿ ${this.args.moves.ad}`})
					, new CharacterString({font: this.font, value: `↓ ⬚ ${this.args.moves.d}`})
					// , new CharacterString({font: this.font, value: `⬚ ❷ ${this.args.moves.x}`})
					// , new CharacterString({font: this.font, value: `⬚ ❸ ${this.args.moves.y}`})
					// , new CharacterString({font: this.font, value: `❹ ❺ ${this.args.moves.r1}`})
					// , new CharacterString({font: this.font, value: `⬚ ▦ ${this.args.moves.ra}`})
					, new CharacterString({font: this.font, value: `⬚ ❾ ${this.args.moves.start}`})
				];
				break;
		}
	}
}
