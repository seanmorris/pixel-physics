import { PointActor } from './PointActor';

export class Big extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-big';

		this.args.width  = 42;
		this.args.height = 46;
	}

	get solid() { return false; }
}
