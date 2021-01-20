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
			this.sample.volume = 0.15 + (Math.random() * -0.05);
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

			viewport.spawn.add({
				time: Date.now() + 3500
				, frame:  this.viewport.args.frameId + 210
				, object: new Ring({x,y})
			});

			if(other.args.owner)
			{
				other.args.owner.args.rings += 1;
			}
			else if(other.occupant)
			{
				other.occupant.args.rings += 1;
			}
			else
			{
				other.args.rings += 1;
			}
		}

		this.args.gone = true;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
