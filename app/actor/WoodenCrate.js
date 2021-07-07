import { PointActor } from './PointActor';

export class WoodenCrate extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type   = 'actor-item actor-wooden-crate';
		this.args.width  = 60;
		this.args.height = 60;
	}

	collideA(other)
	{
		if(other.args.rolling)
		{
			this.viewport.actors.remove(this);

			return false;
		}

		return true;
	}

	get solid() {return true};
	get rotateLock() {return true};
}
