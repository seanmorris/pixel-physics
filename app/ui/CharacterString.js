import { View } from 'curvature/base/View';

export class CharacterString extends View
{
	template =
		`<div cv-ref = "main" class = "hud-character-string [[hide]] [[color]]" cv-each = "chars:char:c" style = "--scale:[[scale]];"><span
				class = "hud-character"
				data-type  = "[[char.type]]"
				data-value = "[[char.pos]]"
				data-index = "[[c]]"
				style      = "--value:[[char.pos]];--index:[[c]];--length:[[chars.length]];"
			>[[char.original]]</span></div>`;

	constructor(...args)
	{
		super(...args);

		this.args.chars = [];

		this.args.scale = this.args.scale || 1;

		const high = this.args.high;
		const med  = this.args.med;
		const low  = this.args.low;

		const charToModel = this.characterToModel.bind(this)

		this.args.bindTo('value', v => {

			// if(Math.abs(v) < low)
			// {
			// 	this.args.color = '';
			// }
			// else if(Math.abs(v) > low)
			// {
			// 	this.args.color = 'yellow';
			// }
			// else if(Math.abs(v) > med)
			// {
			// 	this.args.color = 'orange';
			// }
			// else if(Math.abs(v) > high)
			// {
			// 	this.args.color = 'red';
			// }
			// else if(this.args.flash > 0)
			// {
			// 	this.args.color = this.args.flashColor;
			// }
			// else
			// {
			// 	this.args.color = '';
			// }

			const chars = String(v).split('').map(charToModel);

			if(chars.length !== this.args.chars.length)
			{
				this.args.chars.splice(chars.length);
			}

			Object.assign(this.args.chars, chars);
		});
	}

	characterToModel(pos,i)
	{
		let original = pos;

		let type = 'number';

		if(pos === ' ' || Number(pos) != pos)
		{
			switch(pos)
			{
				case '-':
					pos  = 11;
					type = 'number';
					break;

				case ':':
					pos  = 10;
					type = 'number';
					break;

				case '.':
					pos  = 12;
					type = 'number';
					break;

				case '/':
					pos  = 13;
					type = 'number';
					break;

				case ',':
					pos  = 14;
					type = 'number';
					break;

				case '?':
					pos  = 15;
					type = 'number';
					break;

				case '!':
					pos  = 16;
					type = 'number';
					break;

				case ' ':
					pos  = 17;
					type = 'number';
					break;

				default:
					pos  = String(pos).toLowerCase().charCodeAt(0) - 97;
					type = 'letter';
					break;
			}
		}

		if(this.args.chars[i])
		{
			this.args.chars[i].original = original;
			this.args.chars[i].type     = type;
			this.args.chars[i].pos      = pos;

			return this.args.chars[i];
		}

		return {pos, type, original};
	}
}
