import { View } from 'curvature/base/View';

const layers = [];

export class Backdrop extends View
{
	template = `<div cv-ref = "backdrop" class = "backdrop">
		[[strip.url]]<br />
	</div>`;
	layers   = [];

	onAttached(event)
	{
		const backdrop = this.tags.backdrop;

		const strips = this.args.strips;

		const yPositions = [];
		const xPositions = [];
		const urls       = [];

		let stacked = 0;

		for(const i in strips)
		{
			const strip = strips[i];

			yPositions.push(`calc(calc(1px * ${stacked}))`);

			if(strip.parallax)
			{
				xPositions.push(`calc(1px * calc(${strip.parallax} * var(--x)))`);
			}
			else if(strip.autoscroll)
			{
				xPositions.push(`calc(1px * calc(${strip.autoscroll} * var(--frame) ))`);
			}

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
