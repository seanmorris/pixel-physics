import { PointActor } from './PointActor';

export class MarbleBlock extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-block-marble';

		this.args.width  = 32;
		this.args.height = 32;
	}

	update()
	{
		super.update();

		if(!this.restingOn)
		{
			this.debindYs && this.debindYs();
			this.debindXs && this.debindXs();
			this.debindGs && this.debindGs();
			this.debindX  && this.debindX();
			this.debindY  && this.debindY();
		}
	}

	collideA(other)
	{
		super.collideA(other);

		if(this.args.collType == 'collision-left' || this.args.collType == 'collision-right')
		{
			// this.args.gSpeed = other.args.gSpeed;
		}

		if(this.args.collType == 'collision-left')
		{
			this.args.x = other.x + 17 + other.args.gSpeed;

			other.args.gSpeed = 1;
		}

		if(this.args.collType == 'collision-right')
		{
			this.args.x = other.x + -17 + other.args.gSpeed;

			other.args.gSpeed = 1;
		}

		return true;
	}

	collideB(other)
	{
		super.collideB(other);

		return true;
	}

	get canStick() { return false; }
	get solid() { return true; }
}

