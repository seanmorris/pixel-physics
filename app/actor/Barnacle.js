import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

import { BarnacleTrap } from './BarnacleTrap';

export class Barnacle extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		// this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-barnacle';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.gravity   = 0.75;

		this.args.width     = 34;
		this.args.height    = 32;
		this.args.float     = -1;

		this.willStick = false;
		this.stayStuck = false;

		this.args.patrolPause   = this.args.patrolPause   ?? 10;
		this.args.patrolBeat    = this.args.patrolBeat    ?? 200;
		this.args.patrolSpeed   = this.args.patrolSpeed   ?? 1;

		this.args.showOff = this.args.showOff ?? false;

		this.args.state = 'waiting';

		if(this.args.showOff)
		{
			this.args.state = 'intro';
		}

		this.args.bindTo('state', () => this.args.stateAge = 0);

		this.age = 0;
	}

	update()
	{
		super.update();

		if(!this.trap)
		{
			this.mountPoint = new PointActor;
			this.trap = new BarnacleTrap;

			this.trap.owner = this;

			this.mountPoint.args.x = this.trap.args.x = this.args.x;
			this.mountPoint.args.y = this.trap.args.y = this.args.y;

			this.mountPoint.args.y -= 24;

			this.mountPoint.noClip = true;
			this.mountPoint.args.float = -1;
			this.mountPoint.args.hidden = true;

			this.trap.others.tiedTo = this.mountPoint;

			if(!this.args.showOff)
			{
				this.trap.args.y += this.findRopeLength();
				this.trap.args.ropeLength = this.findRopeLength();
				this.trap.args.xSpeed += 2 * Math.sign(Math.random() + -0.5);
			}

			// this.trap.render();
			// this.trap.initialize();

			this.viewport.spawn.add({object:this.trap});
			// this.viewport.spawn.add({object:this.mountPoint});
		}

		if(this.trap.stuck.size && this.trap.args.ySpeed <= 0)
		{
			this.trap.args.xSpeed *= 0.85;
		}

		const state = this.args.state;

		if(typeof this['state_' + state])
		{
			this['state_' + state]();
		}
	}

	pop(other)
	{
		this.viewport.actors.remove(this.trap);
		this.viewport.actors.remove(this.mountPoint);

		super.pop(other);
	}

	updateEnd()
	{
		super.updateEnd();

		this.args.stateAge++;
	}

	state_intro()
	{
		this.trap.args.ropeLength = 2;

		if(this.args.stateAge > 45)
		{
			this.args.state = 'spitting';
		}
	}

	state_waiting()
	{
		this.args.animation = 'idle';

		if(this.args.stateAge > 40 && this.trap.stuck.size)
		{
			this.args.state = 'feeding';
		}

		if(this.trap.args.ropeLength <= 0)
		{
			this.args.state = 'spitting';
		}
	}

	state_carriage()
	{
		this.args.animation = 'idle';

		if(typeof this.trap.args.ropeLength === 'undefined')
		{
			this.trap.args.ropeLength = 0;
		}

		if(this.args.stateAge > 40)
		{
			this.args.state = 'feeding';
		}
	}

	state_feeding()
	{
		this.args.animation = 'feeding';

		if(this.args.stateAge > 15)
		{
			if(this.trap.args.ropeLength > 48)
			{
				this.trap.args.ropeLength -= 5;
			}
			else
			{
				this.trap.args.ropeLength -= 3;

			}

			this.trap.args.falling = true;
		}

		if(this.args.stateAge > 25)
		{
			this.args.state = 'carriage';
		}

		if(this.trap.args.ropeLength <= 0)
		{
			this.trap.args.ropeLength = 0;
			this.trap.args.float = -1;
			this.args.state = 'spitting';
			this.trap.args.xSpeed = 0;
			this.trap.args.ySpeed = 0;

			for(const [other] of this.trap.stuck)
			{
				if(typeof other.pop === 'function')
				{
					this.trap.stuck.delete(other);
					other.pop();
				}
			}
		}
	}

	state_spitting()
	{
		if(this.args.stateAge === 60)
		{
			this.trap.args.xSpeed += 2 * Math.sign(Math.random() + -0.5);
			// this.trap.args.xSpeed = 3;
		}

		if(this.args.stateAge > 40)
		{
			const length = this.findRopeLength();

			this.trap.args.ropeLength = length + -16;
			this.args.animation = 'spit';
			this.trap.args.float = 0;
			this.trap.args.ySpeed = Math.max(2, this.trap.args.ySpeed);
		}
		else
		{
			// this.trap.args.xSpeed = 0;
			// this.trap.args.ySpeed = 0;
		}

		if(this.args.stateAge > 70)
		{
			this.args.state = 'waiting';
		}
	}

	findRopeLength()
	{
		const endPoint = this.viewport.tileMap.castRay(
				this.args.x, this.args.y, Math.PI / 2, 2048
			);

		return Math.sqrt(
			(this.args.x - endPoint[0]) ** 2
			+ (this.args.y - endPoint[1]) ** 2
		) || 128;
	}

	get solid() { return false; }
	get isEffect() { return false; }
}
