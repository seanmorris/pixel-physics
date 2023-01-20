import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';
import { Ring } from './Ring';

export class SpringTurtle extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-spring-turtle';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 3;
		this.args.gravity   = 0.5;

		this.args.width     = 24;
		this.args.height    = 32;

		this.willStick = false;
		this.stayStuck = false;

		this.args.patrolPause   = this.args.patrolPause   ?? 10;
		this.args.patrolBeat    = this.args.patrolBeat    ?? 120;
		this.args.patrolSpeed   = this.args.patrolSpeed   ?? 1;

		this.args.lastSpring = 0;

		this.age = 0;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoAttr.get(this.box)['data-spring'] = 'springing';
	}

	collideA(other, type)
	{
		if(other.args.static)
		{
			return;
		}

		if(type === 0 || other.args.falling)
		{
			this.ignores.set(other, 15);
			other.args.ySpeed = -20;
			other.args.xSpeed = 0;
			this.args.lastSpring = 10;
			return;
		}

		return super.collideA(other, type);
	}

	update()
	{
		super.update();

		if(this.args.lastSpring > 0)
		{
			this.args.lastSpring--;
		}

		this.args.springing = !!this.args.lastSpring;

		if(this.args.moving && this.args.gSpeed)
		{
			this.args.animation = 'walking';
		}
		else
		{
			this.args.animation = 'standing';
		}

		this.args.direction = Math.sign(this.args.gSpeed);

		this.age++;
	}

	get solid() { return false; }
	get isEffect() { return false; }
}
