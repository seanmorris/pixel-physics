import { Tag } from 'curvature/base/Tag';
import { Behavior } from './Behavior';

export class EmeraldHalo extends Behavior
{
	emeraldColors = [
		'red-alt'
		, 'yellow'
		, 'green'
		, 'cyan'
		, 'white'
		, 'purple'
		, 'pink'
	];

	emeraldParticles = new Set;

	command_3(host, button)
	{
		if(!host.isSuper && host.args.rings < host.args.minRingsSuper)
		{
			return;
		}

		if(host.isSuper && !host.isHyper && host.args.rings < host.args.minRingsHyper)
		{
			return;
		}

		if(host.isHyper || !host.args.falling || !host.args.jumping)
		{
			return;
		}

		while(this.emeraldParticles.size < 7)
		{
			const color = this.emeraldColors[this.emeraldParticles.size];
			const emerald = host.isSuper
				? new Tag(`<img src = "/Sonic/emerald-super-${color}-mini.png">`)
				: new Tag(`<img src = "/Sonic/emerald-${color}-mini.png">`);

			emerald.index = this.emeraldParticles.size;

			emerald.style({
				'--x': host.args.x,
				'--y': host.args.y,
				'--z': host.args.z + 1,
				width: host.isSuper ? '14px': '8px',
				height:host.isSuper ? '10px': '8px',
			});

			host.viewport.particles.add(emerald);

			this.emeraldParticles.add(emerald);

			host.viewport.onFrameOut(60, () => {
				host.viewport.particles.remove(emerald);
				this.emeraldParticles.delete(emerald);
			});
		}
	}

	updateEnd(host)
	{
		for(const emerald of this.emeraldParticles)
		{
			const t = host.transformTime;

			const offset = (2 * Math.PI * emerald.index) / this.emeraldParticles.size;

			const radius = t < 30
				? (Math.min(t * 2, 32) || 3)
				: (45 + -t + 15);

			const x =  Math.cos(offset + t * 0.15) * radius;
			const w = -Math.sin(offset + t * 0.15) * radius;
			const y =  Math.cos(t * 0.075) * w;

			emerald.style({
				'--x': host.args.x + 0 + x,
				'--y': host.args.y + -(host.args.height * 0.65) + y,
				'z-index': host.args.z + -Math.sign(w),
			});
		}
	}
}
