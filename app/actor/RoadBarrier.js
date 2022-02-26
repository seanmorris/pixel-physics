import { PointActor } from './PointActor';

export class RoadBarrier extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = this.args.width  || 64;
		this.args.height = this.args.height || 32;
		this.args.type   = 'actor-item actor-road-barrier';
		this.args.z = 0;
	}

	get solid() { return false; }
}
