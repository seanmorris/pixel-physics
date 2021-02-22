import { View } from 'curvature/base/View';
import { Tag  } from 'curvature/base/Tag';

export class Twist extends View
{
	template = require('./twist.svg');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.id    = 'twist';
		this.args.scale = 0;

		this.args.width  = this.args.width  || '100%';
		this.args.height = this.args.height ||'100%';
	}

	onAttached()
	{
		this.onFrame(()=>{
			// this.args.scale = Math.cos(Date.now() / 500) * 25;
			// this.tags.displace.setAttribute('scale', );
		});

		const displacer = new Tag('<canvas width = "64" height = "64">');

		const context = displacer.getContext('2d');

		context.imageSmoothingEnabled = false;

		const image  = context.getImageData(0, 0, 64, 64);
		const pixels = image.data;

		for(let i = 0; i < pixels.length; i += 4)
		{
			let r,g,b,a,c = 1;

			const w = i / 4;
			const y = Math.floor(w / 64);
			const x = (w % 64);

			const ox = x - 31.5;
			const oy = y - 31.5 - 15.5;

			const p = Math.sqrt(ox**2+oy**2);

			if(p > 32)
			{
				c = 0;
			}
			else
			{
				c = (1 - p / 32) ** 3;
			}

			r = 128 + oy * 4 * c;
			g = 128 - ox * 4 * c;

			pixels[i + 0] = r ?? 0;
			pixels[i + 1] = g ?? 0;
			pixels[i + 2] = b ?? 0;
			pixels[i + 3] = a ?? 255;
		}

		context.putImageData(image, 0, 0);

		displacer.toBlob(png => this.args.blob = URL.createObjectURL(png), 'image/png');
	}

	get name()
	{
		return `${this.args.id}`;
		// return `filter_${this.args.id}`;
	}
}
