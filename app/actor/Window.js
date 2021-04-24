import { PointActor } from './PointActor';

export class Window extends PointActor
{
	float = -1;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-window';

		this.args.width  = 64;
		this.args.height = 160;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
