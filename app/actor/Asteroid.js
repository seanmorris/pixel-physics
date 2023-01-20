import { PointActor } from './PointActor';
import { Block } from './Block';

import { Sfx } from '../audio/Sfx';
import { AsteroidLarge } from './AsteroidLarge';

export class Asteroid extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width   = 80;
		this.args.height  = 80;
		this.args.type    = 'actor-item actor-asteroid';
		this.args.float   = -1;
		this.args.static  = 1;
		this.args.spawned = false;
		this.args.firedAt = 0;
	}

	sleep()
	{
		this.args.spawned = false;
	}

	update()
	{
		if(!this.viewport)
		{
			return;
		}

		const viewport = this.viewport;

		if(viewport.controlActor)
		{
			if(viewport.controlActor.args.respawning)
			{
				return;
			}

			if(viewport.controlActor.args.y < this.args.y)
			{
				return;
			}

			if(Math.abs(viewport.controlActor.args.y - this.args.y) < 128)
			{
				return;
			}
		}

		if(viewport.args.frameId - this.args.firedAt < 90)
		{
			super.update();
			return;
		}

		if(this.args.spawned)
		{
			this.args.spawned = Math.random() >= 0.01;

			super.update();
			return;
		}

		if(viewport.actorIsOnScreen(this, 128))
		{
			viewport.spawn.add({object: new AsteroidLarge({
				xSpeed: this.args.xSpeed
				, ySpeed: this.args.ySpeed
				, x: this.args.x
				, y: this.args.y
			})});

			this.args.spawned = true;
			this.args.firedAt = viewport.args.frameId;
		}
		else
		{
			this.args.spawned = false;
		}

		super.update();
	}

	// get solid() { return true };
}
