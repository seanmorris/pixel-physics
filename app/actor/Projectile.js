import { PointActor } from './PointActor';

export class Projectile extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-projectile';

		this.args.width  = 8;
		this.args.height = 8;

		this.args.float  = -1;

		this.removeTimer = null;
	}

	update()
	{
		if(this.removed)
		{
			return;
		}

		super.update();

		if(!this.args.xSpeed && !this.args.ySpeed)
		{
			this.viewport && this.viewport.actors.remove( this );
		}

		if(!this.removeTimer)
		{
			this.removeTimer = this.onTimeout(2000, ()=>{
				this.viewport && this.viewport.actors.remove( this );
			});
		}
	}

	collideA(other)
	{
		if(other instanceof Projectile)
		{
			return false;
		}

		if(this.viewport)
		{
			this.viewport.actors.remove( this );
		}

		return false;
	}

	collideB(other)
	{
		if(other instanceof Projectile)
		{
			return false;
		}

		if(this.viewport)
		{
			this.viewport.actors.remove( this );
		}

		return false;
	}

	get canStick() { return false; }
	get solid() { return false; }
}
