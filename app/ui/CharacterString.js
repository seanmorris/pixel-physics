import { View } from 'curvature/base/View';
import { Bindable } from 'curvature/base/Bindable';

export class CharacterString extends View
{
	template =
		`<div cv-ref = "main" class = "hud-character-string [[hide]] [[color]] [[font]]" cv-each = "chars:char:c"><span
				class = "hud-character"
				data-type  = "[[char.type]]"
				data-value = "[[char.pos]]"
				data-index = "[[c]]"
				style      = "--value:[[char.pos]];--index:[[c]];--length:[[chars.length]];"
			>[[char.original]]</span></div>`;

	constructor(args = {}, parent)
	{
		args[ Bindable.NoGetters ] = true;

		super(args, parent);

		this[ Bindable.NoGetters ] = true;

		const chars = [];

		chars[ Bindable.NoGetters ] = true;

		this.args.chars = chars;

		this.args.scale = this.args.scale || 1;

		const high = this.args.high;
		const med  = this.args.med;
		const low  = this.args.low;

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

			const chars = String(v).split('').map(this.characterToModel.bind(this));

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
				case ' ':
					pos  = -1;
					type = 'number';
					break;

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

				case '@':
					pos  = 17;
					type = 'number';
					break;

				case '#':
					pos  = 18;
					type = 'number';
					break;

				case '$':
					pos  = 19;
					type = 'number';
					break;

				case '%':
					pos  = 20;
					type = 'number';
					break;

				case '^':
					pos  = 21;
					type = 'number';
					break;

				case '&':
					pos  = 22;
					type = 'number';
					break;

				case '*':
					pos  = 23;
					type = 'number';
					break;

				case '(':
					pos  = 24;
					type = 'number';
					break;

				case ')':
					pos  = 25;
					type = 'number';
					break;

				case '⏺':
					pos  = 0;
					type = 'symbol2';
					break;

				case '▶':
					pos  = 1;
					type = 'symbol2';
					break;

				case '⏸':
					pos  = 2;
					type = 'symbol2';
					break;

				case '⏹':
					pos  = 3;
					type = 'symbol2';
					break;

				case '⏮':
					pos  = 4;
					type = 'symbol2';
					break;

				case '⏭':
					pos  = 5;
					type = 'symbol2';
					break;

				case '\'':
					pos  = 6;
					type = 'symbol2';
					break;

				case '"':
					pos  = 7;
					type = 'symbol2';
					break;

				case '"':
					pos  = 8;
					type = 'symbol2';
					break;

				case '=':
					pos  = 9;
					type = 'symbol2';
					break;

				case '+':
					pos  = 10;
					type = 'symbol2';
					break;

				case '[':
					pos  = 11;
					type = 'symbol2';
					break;

				case ']':
					pos  = 12;
					type = 'symbol2';
					break;

				case '{':
					pos  = 13;
					type = 'symbol2';
					break;

				case '}':
					pos  = 14;
					type = 'symbol2';
					break;

				case '\\':
					pos  = 15;
					type = 'symbol2';
					break;

				case ';':
					pos  = 16;
					type = 'symbol2';
					break;

				case '~':
					pos  = 17;
					type = 'symbol2';
					break;

				case '|':
					pos  = 18;
					type = 'symbol2';
					break;

				case '_':
					pos  = 19;
					type = 'symbol2';
					break;

				case '>':
					pos  = 20;
					type = 'symbol2';
					break;

				case '<':
					pos  = 21;
					type = 'symbol2';
					break;

				case '⯇':
					pos  = 22;
					type = 'symbol2';
					break;

				case '⯅':
					pos  = 23;
					type = 'symbol2';
					break;

				case '⯆':
					pos  = 24;
					type = 'symbol2';
					break;

				// ⯈

				case '`':
					pos  = 25;
					type = 'symbol2';
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
