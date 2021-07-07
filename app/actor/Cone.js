import { PointActor } from './PointActor';

export class Cone extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 16;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-cone';
	}

	get solid() { return false; }
	get isEffect() { return true; }
	get isGhost() { return true; }
}
