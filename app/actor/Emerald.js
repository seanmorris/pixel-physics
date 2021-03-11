import { PointActor } from './PointActor';

export class Emerald extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-emerald emerald-' + (this.args.color || 'white');

		this.args.width  = 12;
		this.args.height = 12;
	}

	update()
	{
		super.update();

		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		if(viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/S3K_9C.wav');
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

		this.args.type = 'actor-item actor-emerald collected emerald-'  + (this.args.color || 'white');

		if(!this.args.gone)
		{
			if(this.viewport.args.audio && this.sample)
			{
				this.sample.play();
			}

			this.args.type = 'actor-item actor-emerald collected gone emerald-' + (this.args.color || 'white');

			this.viewport.actors.remove( this );
			this.remove();

			if(other.args.owner)
			{
				other.args.owner.args.emeralds += 1;
			}
			else if(other.occupant)
			{
				other.occupant.args.emeralds += 1;
			}
			else
			{
				other.args.emeralds += 1;
			}
		}

		this.args.gone = true;
	}

	get solid() { return false; }
	get effect() { return true; }
}
