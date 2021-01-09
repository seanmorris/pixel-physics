import { PointActor } from './PointActor';

import { Explosion } from '../actor/Explosion';
import { Monitor } from '../actor/Monitor';

export class BrokenMonitor extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-monitor actor-monitor-broken';

		this.args.width  = 28;
		this.args.height = 32;
	}

	collideA(other)
	{
		if(other instanceof Monitor)
		{
			this.viewport && this.viewport.actors.remove(this);
			return false;
		}

		super.collideA(other);

		return true;
	}

	get canStick() { return false; }
	get solid() { return false; }
}
