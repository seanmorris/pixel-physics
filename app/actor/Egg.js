import { PointActor } from './PointActor';

export class Egg extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-egg';

		this.args.width  = 15;
		this.args.height = 20;
	}

	lift(actor)
	{
		this.carriedBy = actor;
	}

	update()
	{
		super.update();

		if(this.carriedBy)
		{
			this.args.x = this.carriedBy.x + this.carriedBy.args.direction * 12;
			this.args.y = this.carriedBy.y + -12;
		}
	}

	get solid() { return false; }
}
