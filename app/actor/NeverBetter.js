import { PointActor } from './PointActor';

export class NeverBetter extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-never-better-sign';

		this.args.width  = 84;
		this.args.height = 78;
	}

	get solid() { return false; }
}
