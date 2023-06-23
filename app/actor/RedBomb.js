import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';
import { Tag } from 'curvature/base/Tag';

export class RedBomb extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width   = 8;
		this.args.height  = 8;
		this.args.type    = 'actor-item actor-red-bomb';
		this.args.decel   = 0;

		this.noClip = true;

		this.explosions = new Set;
	}

	update()
	{
		if(!this.args.falling && !this.explosions.size)
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
		this.args.xSpeed = 0;
		this.args.ySpeed = 0;
	}

	explode()
	{
		if(this.exploded)
		{
			return;
		}

		this.exploded = true;

		this.viewport.actors.remove(this);

		Sfx.play('OBJECT_DESTROYED');
	}
}
