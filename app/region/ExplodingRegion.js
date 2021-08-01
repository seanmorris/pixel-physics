import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class ExplodingRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-exploding';

		this.hitSound = new Audio('/Sonic/S3K_6E.wav');
	}

	update()
	{
		const viewport = this.viewport;

		super.update();

		if(!this.args.active)
		{
			return;
		}

		if(!viewport)
		{
			return;
		}

		// if(viewport.args.audio)
		// {
		// 	this.hitSound.currentTime = 0;
		// 	this.hitSound.volume = 0.35 + (Math.random() * -0.15);
		// 	this.hitSound.play();
		// }

		for(let i = 0; i < 1; i++)
		{
			const explosion = new Tag('<div class = "particle-explosion">');
			const xOff = this.args.width * Math.random();
			const yOff = this.args.height * Math.random();

			const left   = Math.max(this.x, -this.viewport.args.x);
			const bottom = Math.max(this.y, -this.viewport.args.y);
			const right  = Math.min(this.x + this.args.width, -this.viewport.args.x + this.viewport.args.width);
			const top    = Math.min(this.y - this.args.height, -this.viewport.args.y - this.viewport.args.height/2);

			const xRange = right - left;
			const yRange = bottom - top;

			explosion.style({'--x': left + xRange * Math.random(), '--y': top + yRange * Math.random()});

			viewport.particles.add(explosion);

			setTimeout(() => viewport.particles.remove(explosion), 512);
		}

	}

	activate()
	{
		this.args.active = true;

		this.viewport.onFrameOut(250, () => this.args.active = false)
	}
}
