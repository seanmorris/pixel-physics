import { PointActor } from './PointActor';

export class Torch extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 16;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-torch';
		this.args.float  = -1;
	}

	get solid() { return false; }
}
