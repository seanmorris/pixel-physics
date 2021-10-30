import { PointActor } from './PointActor';

export class Marker extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type   = 'actor-item actor-marker';

		this.args.width  = 64;
		this.args.height = 64;
		this.args.float  = -1
	}

	get solid() { return false; }
}
