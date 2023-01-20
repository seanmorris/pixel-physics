import { PointActor } from './PointActor';
import { Liftable } from '../behavior/Liftable';

export class Mushroom extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-mushroom';

		this.args.width  = 24;
		this.args.height = 24;

		this.args.size   = 4;

		this.behaviors.add(new Liftable);
	}

	onRendered(event)
	{
		super.onRendered(event);

		const viewport = this.viewport;

		this.onRemove(() => viewport.spawnFromDef(this.objDef));

		this.autoStyle.get(this.box)['--size'] = 'size';
	}

	lift(actor)
	{
		if(this.carriedBy === actor)
		{
			this.carriedBy = null;

			return;
		}

		this.carriedBy = actor;
	}

	get solid() { return false; }
	get rotateLock() { return true; }

	sleep()
	{
		if(!this.viewport)
		{
			return;
		}

		this.viewport.actors.remove(this);
	}
}
