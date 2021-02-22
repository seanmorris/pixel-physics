import { View } from 'curvature/base/View';
import { Tag  } from 'curvature/base/Tag';

export class Cylinder extends View
{
	template = require('./twist.svg');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.scale = this.args.scale || 0;
		this.args.id    = this.args.id    || 'cylinder';

		this.args.width  = this.args.width  || 64;
		this.args.height = this.args.height || 64;
	}

	onAttached()
	{
		this.onFrame(()=>{
			// this.tags.displace.setAttribute('scale', Math.round(Math.sin(Date.now() / 500) * 25));
			// this.args.scale = Math.sin(Date.now() / 500) * 25;
		});

		const displacer = new Tag(`<canvas width = "${this.args.width}" height = "${this.args.height}">`);

		const context = displacer.getContext('2d');

		context.imageSmoothingEnabled = false;

		const image  = context.getImageData(0, 0, this.args.width, this.args.height);
		const pixels = image.data;

		for(let i = 0; i < pixels.length; i += 4)
		{
			let r,g,b,a,c,d = 0;

			const w = i / 4;

			const y = Math.floor(w / this.args.width);
			const x = (w % this.args.width);

			const ox = x - (this.args.width / 2);
			const oy = y - (this.args.height / 2);

			const p = Math.sqrt(ox**2+oy**2);

			const s = Math.min(this.args.width, this.args.height) / 2;

			c = Math.abs(ox / this.args.width) / 2;
			// d = p / s;

			r = 128 + (ox * 4) * c;
			g = 128; // + (oy * 4) * d;
			b = 0;

			pixels[i + 0] = r ?? 128;
			pixels[i + 1] = g ?? 128;
			pixels[i + 2] = b ?? 128;
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
