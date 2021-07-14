import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class Rocket extends PointActor
{
	constructor(...args)
	{
		super(...args);

		// this.args.width  = this.public.width  || 32;
		// this.args.height = this.public.height || 32;

		this.args.width  = 32;
		this.args.height = 16;

		this.args.xMax = this.args.xMax ?? 24;
		this.args.yMax = this.args.yMax ?? 24;

		this.args.type   = 'actor-item actor-rocket';

		this.args.launched = false;
	}

	update()
	{
		if(!this.viewport)
		{
			return;
		}

		if(this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/object-destroyed.wav');
			this.sample.volume = 0.6 + (Math.random() * -0.3);
		}

		super.update();

		if(this.args.launched && Math.abs(this.args.xSpeed) < Math.abs(this.args.xMax))
		{
			this.args.xSpeed += 0.5 * Math.sign(this.args.xMax);
		}

		if(this.args.launched && Math.abs(this.args.ySpeed) < Math.abs(this.args.yMax))
		{
			this.args.ySpeed -= 0.5 * Math.sign(this.args.yMax);
		}

		if(this.args.launched && this.args.xSpeed === 0 && this.args.ySpeed === 0)
		{
			this.explode();
		}
	}

	activate()
	{
		this.args.launched = true;

		if(this.args.xMax)
		{
			this.args.xSpeed += 0.5;
		}

		if(this.args.yMax)
		{
			this.args.ySpeed -= 0.5;
		}
	}

	sleep()
	{
		if(this.args.launched)
		{
			this.explode();
		}
	}

	wakeUp()
	{
		// this.args.xSpeed = 0;
		// this.args.ySpeed = 0;
		// this.args.x = this.def.get('x');
		// this.args.y = this.def.get('y');
	}

	explode()
	{
		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		const explosion = new Tag('<div class = "particle-explosion">');

		explosion.style({'--x': this.x, '--y': this.y-8});

		viewport.particles.add(explosion);

		setTimeout(() => viewport.particles.remove(explosion), 512);

		if(viewport.args.audio && this.sample)
		{
			this.sample.play();
		}

		this.args.launched = false;

		this.args.xSpeed = 0;
		this.args.ySpeed = 0;

		this.args.x = this.def.get('x');
		this.args.y = this.def.get('y');

		this.viewport.setColCell(this);

		this.onNextFrame(() => {
			this.args.launched = false;

			this.args.xSpeed = 0;
			this.args.ySpeed = 0;

			this.args.x = this.def.get('x');
			this.args.y = this.def.get('y');

			this.viewport.setColCell(this);
		});


	}
}
