import { PointActor } from './PointActor';

export class Flag extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 45;
		this.args.height = 53;
		this.args.type   = 'actor-item actor-flag';
		this.args.z = 0;
	}

	get solid() { return false; }
}
