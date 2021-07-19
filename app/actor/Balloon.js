import { PointActor } from './PointActor';

export class Balloon extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-balloon';

		this.args.width  = 32;
		this.args.height = 33;
		this.args.float  = -1;

		this.args.airAngle = -Math.PI;
	}

	collideA(other)
	{
		if(!other.controllable)
		{
			return;
		}
	}
}
