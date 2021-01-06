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

		this.sample = new Audio('/Sonic/ring-collect.wav');

		this.sample.volume = 0.01 + (Math.random() * 0.025);
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
			this.sample.play();

			this.onTimeout(240, () => {
				this.args.type = 'actor-item actor-ring collected gone'
			});

			this.onTimeout(480, () => {
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

			}, 3500);

			other.args.rings++;
		}

		this.args.gone = true;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
