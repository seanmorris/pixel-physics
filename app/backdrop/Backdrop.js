import { View } from 'curvature/base/View';

const layers = [];

export class Backdrop extends View
{
	template = `<div class = "backdrop [[name]]">
		<div cv-ref = "backdrop" class = "parallax"></div>
	</div>`;

	layers = [];
	urls   = [];

	stacked = 0;

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

		this.urls = urls;

		this.stacked = stacked;

		const xPos = xPositions.join(', ');
		const yPos = yPositions.join(', ');
		const url  = this.urls.map(u=>`url(${u})`).join(', ');

		backdrop.style({
			'background-position-y':   yPos
			, 'background-position-x': xPos
			, 'background-repeat':     'repeat-x'
			, 'background-image':      url
			, '--x': this.args.x
			, '--y': this.args.y
		});

		this.args.bindTo(
			['x', 'y', 'xMax', 'yMax', 'frame', 'stacked', 'top', 'bottom']
			, (v,k) => backdrop.style({[`--${k}`]: v})
		);

		this.args.bindTo('frame', (v,k) => {
			for(const i in this.args.strips)
			{
				const strip = this.args.strips[i];

				if(strip.frames)
				{
					if(strip.timeout-- === 0)
					{
						strip.timeout = strip.interval;
						strip.frame++;

						if(strip.frame >= strip.frames.length)
						{
							strip.frame = 0;
						}

						this.urls[i] = strip.frames[ strip.frame ];

						this.refreshLayers();
					}

				}
			}
		});
	}

	refreshLayers()
	{
		this.tags.backdrop.style({
			'background-image': this.urls.map(u=>`url(${u})`).join(', ')
		});
	}
}
