import { PointActor } from './PointActor';

export class Ring extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-ring';

		this.args.width  = 32;
		this.args.height = 32;
		this.args.float  = -1;
		this.args.gone   = false;
	}

	update()
	{
		super.update();

		if(this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/ring-collect.wav');
			this.sample.volume = 0.2 + (Math.random() * -0.1);
		}
	}

	collideA(other)
	{
		super.collideA(other);

		if(this.args.gone)
		{
			return;
		}

		this.args.type = 'actor-item actor-ring collected';

		if(!this.args.gone)
		{
			if(this.viewport.args.audio && this.sample)
			{
				this.sample.play();
			}

			this.onTimeout(60, () => {
				this.args.type = 'actor-item actor-ring collected gone'
			});

			this.onTimeout(120, () => {
				this.viewport.actors.remove( this );
				this.remove();
			});

			const x = this.x;
			const y = this.y;

			const viewport = this.viewport;

			setTimeout(() => {

				viewport.spawn.add({
					time: Date.now() + 3500
					, object: new Ring({x,y})
				});

			}, 7500);

			other.args.rings++;
		}

		this.args.gone = true;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
