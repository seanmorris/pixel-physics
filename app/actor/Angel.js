import { PointActor } from './PointActor';
import { Liftable } from '../behavior/Liftable';

export class Angel extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-angel';

		this.args.width  = 45;
		this.args.height = 80;
	}
}
