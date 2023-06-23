import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';
import { Tag } from 'curvature/base/Tag';

import { RedBomb } from './RedBomb';

export class SpikeBomb extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width   = 24;
		this.args.height  = 24;
		this.args.type    = 'actor-item actor-spike-bomb';
		this.args.decel   = 0;

		this.explosions = new Set;
	}

	update()
	{

		if(!this.args.falling && this.groundTime > 1)
		{
			this.explode();
		}

		super.update();

		for(const explosion of this.explosions)
		{
			explosion.style({'--x': this.args.x, '--y': this.args.y + -16});
		}
	}

	collideA(other)
	{
		if(!other.controllable)
		{
			return;
		}

		other.damage(this);
		this.explode();
		this.args.float = -1;
		// this.args.xSpeed = 0;
		// this.args.ySpeed = 0;
	}

	explode()
	{
		if(this.exploded)
		{
			return;
		}

		this.exploded = true;

		this.args.type = 'actor-item actor-air-bomb hide';

		const redA = new RedBomb({x:this.args.x, y:this.args.y + -1, owner:this});
		const redB = new RedBomb({x:this.args.x, y:this.args.y + -1, owner:this});

		redA.args.ySpeed = -this.ySpeedLast * 0.5;
		redB.args.ySpeed = -this.ySpeedLast * 0.5;

		redA.args.xSpeed = -this.ySpeedLast * 0.35;
		redB.args.xSpeed = +this.ySpeedLast * 0.35;

		this.viewport.spawn.add({object:redA});
		this.viewport.spawn.add({object:redB});

		this.viewport.actors.remove(this);

		Sfx.play('OBJECT_DESTROYED');
	}
}
