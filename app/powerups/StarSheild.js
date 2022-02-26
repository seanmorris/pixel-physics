import { Sheild } from './Sheild';
import { Tag } from 'curvature/base/Tag';

export class StarSheild extends Sheild
{
	type     = 'star';
	protect  = true;
	template = `<div class = "sheild star-sheild">
		<div class = "star-sheild-stars"></div>
	</div>`;

	frame = 0;

	acquire(host)
	{
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		const previous = host.args.currentSheild;

		const invertDamage = event => {

			event.preventDefault();

			const other = event.detail.other;

			other && other.pop && other.pop(host);

		};

		host.addEventListener('damage', invertDamage);

		viewport.onFrameOut(600, () => {

			host.inventory.remove(this);

			host.removeEventListener('damage', invertDamage);

			host.args.currentSheild = previous;
		});
	}

	drop(host)
	{
		console.log(this, host);
	}

	update(host)
	{
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		const particle = new Tag('<div class = "particle-stars">');

		const point = host.rotatePoint(host.args.gSpeed, (host.args.height / 2));

		const dashed = host.dashed || host.args.animation === 'springdash';

		particle.style({
			'--x': point[0] + host.x + -3 + host.args.xSpeed
			, '--y': point[1] + host.y + (dashed ? -18 : 0) + host.args.ySpeed
			, '--frame': this.frame++
			, 'z-index': -1
			, opacity: Math.random() * 2
		});

		viewport.particles.add(particle);

		viewport.onFrameOut(15,() => viewport.particles.remove(particle));
	}
}
