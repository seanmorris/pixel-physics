import { PointActor } from './PointActor';

export class Coin extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-coin';

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
			this.sample = new Audio('/mario/smw_coin.wav');
			this.sample.volume = 0.25 + (Math.random() * 0.5);
		}
	}

	collideA(other)
	{
		super.collideA(other);

		if(this.args.gone)
		{
			return;
		}

		this.args.type = 'actor-item actor-coin collected';

		if(!this.args.gone)
		{
			if(this.viewport.args.audio && this.sample)
			{
				this.sample.play();
			}

			this.onTimeout(240, () => {
				this.args.type = 'actor-item actor-coin collected gone'
			});

			this.onTimeout(480, () => {
				this.viewport.actors.remove( this );
				this.remove();
			});

			const x = this.x;
			const y = this.y;

			const viewport = this.viewport;

			viewport.spawn.add({
				time: Date.now() + 3500
				, object: new Coin({x,y})
			});

			other.args.coins++;
		}

		this.args.gone = true;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
