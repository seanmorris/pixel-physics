import { PointActor } from './PointActor';

export class CautionSign extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 20;
		this.args.height = 60;
		this.args.type   = 'actor-item actor-caution-sign';
	}

	get solid() { return false; }
}
