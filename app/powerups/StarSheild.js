import { Sheild } from './Sheild';
import { Tag } from 'curvature/base/Tag';

export class StarSheild extends Sheild
{
	type     = 'star';
	template = `<div class = "sheild star-sheild">
		<div class = "star-sheild-stars"></div>
	</div>`;

	frame = 0;

	update(host)
	{
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		const particle = new Tag('<div class = "particle-stars">');

		const point = host.rotatePoint(host.args.gSpeed, (host.args.height / 2));

		particle.style({
			'--x': point[0] + host.x + -4
			, '--y': point[1] + host.y + (host.dashed ? -8 : 0)
			, '--frame': this.frame++
			, 'z-index': -1
			, opacity: Math.random() * 2
		});

		viewport.particles.add(particle);

		viewport.onFrameOut(15,() => viewport.particles.remove(particle));
	}
}
