import { PointActor } from './PointActor';
import { Spikes } from './Spikes';

export class SpikesSmall extends Spikes
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-spikes actor-spikes-small';

		this.args.width  = args.width  || 32;
		this.args.height = args.height || 10;

		this.args.pointing = this.args.pointing || 0;

		this.hazard = true;
	}

	activate()
	{
		this.args.float = 0;
		this.noClip = true;
	}
}
