import { PointActor } from './PointActor';

export class Monitor extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-monitor';

		this.args.width  = 28;
		this.args.height = 32;
	}

	collideWith(other)
	{
		super.collideWith(other);
	}
}
