import { PointActor } from './PointActor';

export class Block extends PointActor
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-block';

		this.args.width  = 32;
		this.args.height = 32;

		this.args.float  = -1;

		this.args.collapse = args.collapse ?? false;
	}

	collideA(other, type)
	{
		if(this.public.collapse && type === 0)
		{
			this.args.float = 10;
		}

		return true;
	}

	sleep()
	{
		if(!this.args.float)
		{
			this.viewport && this.viewport.actors.remove(this);
		}
	}

	update()
	{
		super.update();

		if(!this.args.float && !this.args.falling)
		{
			this.viewport && this.viewport.actors.remove(this);
		}
	}

	get rotateLock() { return true; }
	get canStick() { return false; }
	get solid() { return this.public.float || this.public.falling; }
}

