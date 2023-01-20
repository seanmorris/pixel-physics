import { PointActor } from './PointActor';
import { Block } from './Block';

import { Sfx } from '../audio/Sfx';

export class AsteroidSmall extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 32;
		this.args.height = 32;
		// this.args.gravity = 0.85;
		this.args.type   = 'actor-item actor-asteroid-small';
		this.noClip = true;
		// this.args.float = -1;
	}

	sleep()
	{
		this.viewport && this.viewport.actors.remove(this);
	}

	collideA(other)
	{
		if(!other.controllable || other.args.mercy)
		{
			return;
		}

		this.args.xSpeed = 0;

		other.damage(this, 'rock');
		Sfx.play('ROCK_BREAK_2');
	}

	damage(){}

	get rotateLock() { return true };
	// get solid() { return true };
}
