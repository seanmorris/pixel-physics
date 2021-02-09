import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { Twist } from '../effects/Twist';
import { Pinch } from '../effects/Pinch';

export class Sonic extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type      = 'actor-item actor-sonic';

		this.args.accel     = 0.35;
		this.args.decel     = 0.7;

		this.args.skidTraction = 1.75;

		this.args.gSpeedMax = 30;
		this.args.jumpForce = 15;
		this.args.gravity   = 0.7;

		this.args.width  = 32;
		this.args.height = 40;
	}

	onAttached()
	{
		this.box    = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		// this.twister = new Pinch;
		this.twister = new Twist;

		this.viewport.effects.add(this.twister);

		this.args.fgFilter = `url(#twist)`;
		this.args.bgFilter = `url(#twist)`;

		// this.twister.listen('attached', () => , {once:true});

		// const displacer = new Tag('<canvas width = "64" height = "64">');

		// const context = displacer.getContext('2d');

		// context.imageSmoothingEnabled = false;

		// const image  = context.getImageData(0, 0, 64, 64);
		// const pixels = image.data;

		// for(let i = 0; i < pixels.length; i += 4)
		// {
		// 	let r,g,b,a,c = 1;

		// 	const w = i / 4;
		// 	const y = Math.floor(w / 64);
		// 	const x = (w % 64);

		// 	const ox = x - 31.5;
		// 	const oy = y - 31.5;

		// 	// r = 128 - Math.abs(oy * 4);
		// 	// g = 128 - Math.abs(ox * 4);
		// 	// b = 0;

		// 	const p = Math.sqrt(ox**2+oy**2);

		// 	if(p > 32)
		// 	{
		// 		c = 0;
		// 	}
		// 	else
		// 	{
		// 		c = 1 - p / 32;
		// 	}

		// 	const tr = ((Math.atan2(ox, oy) - (Math.PI * 0.50)) % (Math.PI * 2));
		// 	const tg = ((Math.atan2(ox, oy) - (Math.PI * 0.00)) % (Math.PI * 2));

		// 	r = 128 + (ox * 4) * c;
		// 	g = 128 + (oy * 4) * c;
		// 	b = 0;

		// 	// r = Math.abs((Math.PI/4 - tr) * 255);
		// 	// g = Math.abs((Math.PI/2 - tg) * 255);

		// 	pixels[i + 0] = r ?? 0;
		// 	pixels[i + 1] = g ?? 0;
		// 	pixels[i + 2] = b ?? 0;
		// 	pixels[i + 3] = a ?? 255;
		// }

		// context.putImageData(image, 0, 0);

		// displacer.toBlob(png => {

		// 	const display = new Tag(`<img class = "displace" src = "${URL.createObjectURL(png)}" />`);

		// 	display.style({
		// 		'--x':       this.x
		// 		, '--y':     this.y - 100
		// 		, 'z-index': 100*100
		// 	});

		// 	this.viewport.particles.add(display);

		// }, 'image/png');
	}

	update()
	{
		const falling = this.args.falling;

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(speed > maxSpeed / 2)
			{
				this.box.setAttribute('data-animation', 'running');
			}
			else if(this.args.moving && this.args.gSpeed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}
		else
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		super.update();

		// this.twister.args.scale = Math.abs(this.args.gSpeed);

		if(!this.public.falling && this.twister && Math.abs(this.public.gSpeed) > 15)
		{
			this.twister.args.scale = this.public.gSpeed / 2;
		}
		else
		{
			this.twister.args.scale = 0;
		}
	}

	get solid() { return false; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
