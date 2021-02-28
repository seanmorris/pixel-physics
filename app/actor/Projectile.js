import { PointActor } from './PointActor';
import { Explosion } from '../actor/Explosion';

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
			this.explode();
		}

		if(!this.removeTimer)
		{
			this.removeTimer = this.onTimeout(4000, () => this.explode());
		}
	}

	collideA(other)
	{
		if(other === this.args.owner || other instanceof Projectile || other instanceof Explosion)
		{
			return false;
		}

		if(this.viewport)
		{
			this.explode();
		}

		return false;
	}

	explode()
	{
		const viewport  = this.viewport;

		if(!viewport)
		{
			return;
		}

		const explosion = new Explosion({x:this.x, y:this.y+8});

		viewport.actors.add(explosion);

		setTimeout(()=>{
			viewport.actors.remove( explosion );
		}, 20);

		this.viewport.actors.remove( this );
		this.remove();
	}

	get canStick() { return false; }
	get solid() { return false; }
}
