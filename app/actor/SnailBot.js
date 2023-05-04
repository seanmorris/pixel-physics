import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

export class SnailBot extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-snailbot';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 24;
		this.args.height    = 32;

		this.willStick = false;
		this.stayStuck = false;

		this.args.patrolPause   = this.args.patrolPause   ?? 20;
		this.args.patrolBeat    = this.args.patrolBeat    ?? 100;
		this.args.patrolSpeed   = this.args.patrolSpeed   ?? 1;
	}

	update()
	{
		super.update();

		if(this.args.moving && this.args.gSpeed)
		{
			this.args.animation = 'walking';
		}
		else
		{
			this.args.animation = 'standing';
		}

		this.args.direction = Math.sign(this.args.gSpeed);
	}

	get solid() { return false; }
	get isEffect() { return false; }
}
