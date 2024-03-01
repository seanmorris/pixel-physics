import { View } from 'curvature/base/View';

export class CharacterPreview extends View
{
	preserve = true;
	template =	`<div class = "character-preview" data-character = "[[setting]]">
	<div class = "character"></div>
	<div class = "emeralds" cv-each = "emeralds:emerald">
		<img style = "--x:[[emerald.x]];--y:[[emerald.y]];" src = "/Sonic/emerald-[[emerald.type|suffix]][[emerald.color]]-mini.png" />
	</div>
	<div class = "rings"></div>
	<div class = "score"></div>
</div>`;

	onAttached()
	{
		const type = 'super';

		// const emeralds = this.args.emeralds = [
		//       {x: 0, y: 0, type, color: 'red-alt'}
		// 	, {x: 0, y: 0, type, color: 'yellow' }
		// 	, {x: 0, y: 0, type, color: 'green'  }
		// 	, {x: 0, y: 0, type, color: 'cyan'   }
		// 	, {x: 0, y: 0, type, color: 'white'  } //
		// 	, {x: 0, y: 0, type, color: 'purple' } //
		// 	, {x: 0, y: 0, type, color: 'pink'   } //
		// ];

		const emeralds = this.args.emeralds = [];

		if(this.parent && this.parent.currentSave)
		for(const storedEmerald of this.parent.currentSave.emeralds)
		{
			// this.args.emeralds.push({x: 0, y: 0, type, color: storedEmerald});
			this.args.emeralds.push({x: 0, y: 0, color: storedEmerald});
		}

		const spacing = emeralds.length;

		this.onFrame(() => {
			let e = 0

			if(spacing)
			for(const emerald of emeralds)
			{
				const time = Date.now() / 400;
				const roll = (e++ * (Math.PI*2) / spacing) + time;

				emerald.x = Math.cos(roll);
				emerald.y = Math.sin(roll);
			}
		});
	}

	suffix(type) { return type ? `${type}-` : ``; }
}
