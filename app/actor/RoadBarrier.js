import { PointActor } from './PointActor';

export class RoadBarrier extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = this.public.width  || 64;
		this.args.height = this.public.height || 32;
		this.args.type   = 'actor-item actor-road-barrier';
	}

	get solid() { return false; }
}
