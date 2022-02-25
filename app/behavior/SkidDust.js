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
		if(host.args.falling || host.args.rolling || host.spindashCharge)
		{
			return;
		}

		if(host.args.wallSticking || host.args.climbing)
		{
			return;
		}

		const direction = host.args.direction;

		if(!Math.sign(host.args.gSpeed) || !Math.sign(direction))
		{
			return;
		}

		if(Math.abs(host.args.gSpeed - direction) < 5)
		{
			return;
		}

		if(!host.alwaysSkidding)
		{
			if(Math.sign(host.args.gSpeed) === Math.sign(direction))
			{
				return;
			}

			if(!host.skidding)
			{
				return;
			}
		}

		const viewport  = host.viewport;
		const dustFreq  = host.distFreq || 2;

		if(viewport.args.frameId % dustFreq !== 0)
		{
			return;
		}

		const dustParticle = new Tag(document.createElement('div'));

		dustParticle.classList.add(this.dustType);

		const dustDist = Math.sign(host.args.gSpeed) * host.dustDist || 0;

		// const dustPoint = host.rotatePoint(host.args.gSpeed, 0);
		const dustPoint = host.groundPoint;

		dustParticle.style({
			'--x': dustPoint[0] + dustDist
			, '--y': dustPoint[1]
			, 'z-index': 0
			, opacity: Math.random() * 0.25 + 0.5
		});

		viewport.particles.add(dustParticle);

		viewport.onFrameOut(20, () => {
			viewport.particles.remove(dustParticle);
		});
	}
}
