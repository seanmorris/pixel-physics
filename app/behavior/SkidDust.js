import { Tag  } from 'curvature/base/Tag';

import { Behavior } from './Behavior';

export class SkidDust extends Behavior
{
	constructor(dustType)
	{
		super();

		this.dustType = dustType || 'particle-dust';
	}

	update(host)
	{
		if(host.public.falling || host.public.rolling)
		{
			return;
		}

		if(host.public.wallSticking || host.public.climbing)
		{
			return;
		}

		const direction = host.public.direction;

		if(!Math.sign(host.public.gSpeed) || !Math.sign(direction))
		{
			return;
		}

		if(Math.sign(host.public.gSpeed) === Math.sign(direction))
		{
			return;
		}

		if(Math.abs(host.public.gSpeed - direction) < 5)
		{
			return;
		}

		if(!host.skidding)
		{
			return;
		}

		const viewport  = host.viewport;

		if(viewport.args.frameId % 2 !== 0)
		{
			return;
		}

		const dustParticle = new Tag(`<div class = "${this.dustType}">`);

		const dustPoint = host.rotatePoint(host.public.gSpeed, 0);

		dustParticle.style({
			'--x': dustPoint[0] + host.x
			, '--y': dustPoint[1] + host.y
			, 'z-index': 0
			, opacity: Math.random() * 2
		});

		viewport.particles.add(dustParticle);

		setTimeout(() => {
			viewport.particles.remove(dustParticle);
		}, 350);
	}
}
