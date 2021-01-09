import { View } from 'curvature/base/View';

export class CharacterString extends View
{
	template =
		`<div class = "hud-character-string [[hide]] [[color]]" cv-each = "chars:char:c" style = "--scale:[[scale]];"><span
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

		this.args.bindTo(['value'], v => {

			if(Math.abs(v) > this.args.high)
			{
				this.args.color = 'red';
			}
			else if(Math.abs(v) > this.args.med)
			{
				this.args.color = 'orange';
			}
			else if(Math.abs(v) > this.args.low)
			{
				this.args.color = 'yellow';
			}
			// else if(this.args.flash > 0)
			// {
			// 	this.args.color = this.args.flashColor;
			// }
			else
			{
				this.args.color = '';
			}

			const chars = String(v).split('').map((pos,i) => {

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

						case ' ':
							pos  = 14;
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
			});

			Object.assign(this.args.chars, chars);

			this.args.chars.splice(chars.length);

		});
	}
}
