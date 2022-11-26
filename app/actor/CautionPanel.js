import { PointActor } from './PointActor';

export class CautionPanel extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 80;
		this.args.height = 48;
		this.args.type   = 'actor-item actor-caution-panel';
		this.args.z      = 0;
	}

	get solid() { return false; }
}
