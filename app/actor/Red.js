import { PointActor } from './PointActor';

export class Red extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-red';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.width     = 16;
		this.args.height    = 16;

		this.args.float  = -1;
	}
}
