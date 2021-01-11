import { PointActor } from './PointActor';

export class Explosion extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-explosion';

		this.args.width  = 48;
		this.args.height = 48;

		this.args.float  = -1;

		this.removeTimer = null;
	}

	update()
	{
		super.update();

		if(!this.removeTimer)
		{
			const viewport = this.viewport;

			this.removeTimer = this.onTimeout(360, ()=>{
				viewport.actors.remove( this );
			});
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
