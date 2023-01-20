import { PointActor } from './PointActor';
import { Block } from './Block';

import { Sfx } from '../audio/Sfx';

export class AsteroidBase extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width   = 80;
		this.args.height  = 80;
		this.args.type    = 'actor-item actor-asteroid';

		this.args.broken  = false;
		this.args.decel   = 0;
	}

	sleep()
	{
		this.viewport && this.viewport.actors.remove(this);
	}

	update()
	{
		if(!this.viewport || this.args.broken)
		{
			super.update();
			this.args.groundAngle = 0;
			return;
		}

		const viewport = this.viewport;

		if(!this.args.falling)
		{
			this.break();
		}

		super.update();

		this.args.groundAngle = 0;

		if(!this.viewport.actorIsOnScreen(this, 128))
		{
			this.viewport && this.viewport.actors.remove(this);
		}
	}

	get rotateLock() { return true };
}
