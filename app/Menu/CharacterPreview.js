import { View } from 'curvature/base/View';

export class CharacterPreview extends View
{
	preserve = true;
	template =	`<div class = "character-preview" data-character = "[[setting]]">
	<div class = "character"></div>
	<div class = "emeralds" cv-each = "emeralds:emerald">[[emerald]]</div>
	<div class = "rings"></div>
	<div class = "score"></div>
</div>`;

	constructor(args, parent)
	{
		super(args, parent);

		const emeralds = this.args.emeralds = [
			  View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-red-alt-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-purple-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-pink-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-yellow-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-cyan-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-green-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-white-mini.png" />')
		];

		this.onFrame(() => {
			let e = 0

			for(const emerald of emeralds)
			{
				const time = Date.now() / 300;
				const roll = (e++ * (Math.PI*2) / 7) + time;

				emerald.args.x = Math.cos(roll);
				emerald.args.y = Math.sin(roll);
			}
		});
	}
}
