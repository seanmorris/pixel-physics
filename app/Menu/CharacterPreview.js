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

	onAttached(args, parent)
	{
		// const emeraldsFound = [];

		// if(viewport.currentSave && viewport.currentSave.emeralds)
		// {
		// 	Object.assign(emeraldsFound, viewport.currentSave.emeralds.slice(0,2));
		// }

		// emeraldsFound.map(e => console.log(e));

		// const emeralds = emeraldsFound.map(e => View.from(`<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-${e}-mini.png" />`));

		// this.args.emeralds = emeralds;

		const emeralds = this.args.emeralds = [
			  View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-red-alt-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-purple-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-pink-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-yellow-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-cyan-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-green-mini.png" />')
			, View.from('<img style = "--x:[[x]];--y:[[y]];" src = "/Sonic/emerald-super-white-mini.png" />')
		];

		// let spacing = 7;
		let spacing = emeralds.length;

		this.onFrame(() => {
			let e = 0

			if(spacing)
			for(const emerald of emeralds)
			{
				const time = Date.now() / 300;
				const roll = (e++ * (Math.PI*2) / spacing) + time;

				emerald.args.x = Math.cos(roll);
				emerald.args.y = Math.sin(roll);
			}
		});
	}
}
