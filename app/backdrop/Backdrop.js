import { View } from 'curvature/base/View';

const layers = [];

export class Backdrop extends View
{
	template = `<div class = "backdrop">
		<div cv-ref = "backdrop" class = "parallax"></div>
	</div>`;
	layers   = [];

	onAttached(event)
	{
		if(this.alreadyAttached)
		{
			return;
		}

		this.alreadyAttached = true;

		const backdrop = this.tags.backdrop;

		const strips = this.args.strips.reverse();

		const yPositions = [];
		const xPositions = [];
		const urls       = [];

		let stacked = 0;

		for(const i in strips)
		{
			const strip = strips[i];

			yPositions.push(`calc(100% - calc(1px * ${stacked}))`);

			let xFormula = `0px`;

			if(strip.parallax)
			{
				xFormula = `calc(${xFormula} + calc(1px * calc(${strip.parallax} * var(--x))))`;
			}

			if(strip.autoscroll)
			{
				xFormula = `calc(${xFormula} + calc(1px * calc(${strip.autoscroll} * var(--frame) )) )`;
			}

			xPositions.push(xFormula);

			urls.push(strips[i].url);

			stacked += (strips[i].height - 1);
		}

		const xPos = xPositions.join(', ');
		const yPos = yPositions.join(', ');
		const url = urls.map(u=>`url(${u})`).join(', ');

		backdrop.style({
			'background-position-y':   yPos
			, 'background-position-x': xPos
			, 'background-repeat':     'repeat-x'
			, 'background-image':      url
			, '--x': this.args.x
			, '--y': this.args.y
		});

		this.args.bindTo(
			['x', 'y', 'xMax', 'yMax', 'frame']
			, (v,k) => backdrop.style({[`--${k}`]: v})
		);
	}
}
