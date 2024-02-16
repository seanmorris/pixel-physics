import { View } from 'curvature/base/View';

import { Png } from '../sprite/Png';

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

		const stripRecolors = [];

		for(const i in strips)
		{
			const recolors = [];

			const strip = strips[i];

			yPositions.push(`calc(100% - calc(1px * ${stacked}))`);

			let xFormula = `calc(var(--xOffset, 0px) * 1px)`;

			if(strip.parallax)
			{
				xFormula = `calc(${xFormula} + calc(1px * calc(${strip.parallax} * var(--xPan))))`;
			}

			if(strip.autoscroll)
			{
				xFormula = `calc(${xFormula} + calc(1px * calc(${strip.autoscroll} * var(--frame) )) )`;
			}

			xPositions.push(xFormula);

			urls.push(strips[i].url);

			stacked += (strips[i].height - 1);

			if(strip.recolor)
			{
				const stripPng = new Png(strip.url);

				for(const pallete of strip.recolor)
				{
					recolors.push(stripPng.ready.then(
						() => stripPng.recolor(pallete).toDataUri()
					));
				}

				const stripRecolor = Promise.all(recolors).then(frames => strip.frames = frames);

				stripRecolors.push(stripRecolor);
			}
		}

		Promise.all(stripRecolors).then(() => {
			this.refreshLayers();
		});

		this.urls = urls;

		this.stacked = stacked;

		const xPos = xPositions.join(', ');
		const yPos = yPositions.join(', ');
		const url  = this.urls.map(u=>`url(${u})`).join(', ');

		this.args.xOffset = 0;

		backdrop.style({
			'background-position-y':   yPos
			, 'background-position-x': xPos
			, 'background-repeat':     'repeat-x'
			, 'background-image':      url
			, '--stackHeight':         stacked
		});

		this.args.bindTo(
			['x', 'y', 'xPan', 'yPan', 'bX', 'bY', 'width', 'height', 'right', 'xMax', 'yMax', 'frame', 'stacked', 'top', 'bottom', 'xOffset']
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
