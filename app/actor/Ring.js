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
			this.onTimeout(240, () => {
				this.args.type = 'actor-item actor-ring collected gone'
			});

			this.onTimeout(480, () => {
				this.viewport.actors.remove( this );
			});

			other.args.rings++;
		}

		this.args.gone = true;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
