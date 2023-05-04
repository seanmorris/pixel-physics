import { PointActor } from './PointActor';

export class SpitSteam extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type   = 'actor-item actor-spitsteam';
		this.args.width  = 79;
		this.args.height = 16;
		this.args.float  = -1;
		this.noClip = true;
	}

	update()
	{
		if(this.age > 30)
		{
			this.args.gone = true;
			this.viewport.actors.remove(this);
			this.remove();
			return;
		}

		super.update();
	}

	collideA(other)
	{
		if(this.age < 8)
		{
			return;
		}

		if(!other.controllable)
		{
			return;
		}

		if(this.args.owner && !this.args.owner.args.gone)
		{
			other.args.ignore = 3;
			other.args.antiSkid = 8;
			other.args.x += this.args.direction;
			other.args.xSpeed  = this.args.direction * 12;
			other.args.falling = true;
			// other.controllable && other.damage(this, 'fire');
		}
	}
}
