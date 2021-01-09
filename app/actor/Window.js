import { PointActor } from './PointActor';

export class Window extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-window';

		this.args.width  = 64;
		this.args.height = 160;

		this.args.float  = -1;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
