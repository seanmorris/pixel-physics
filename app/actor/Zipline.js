import { PointActor } from './PointActor';

export class Zipline extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 1;
		this.args.height = 1;
		this.args.type   = 'actor-item actor-zipline';
		this.args.z      = 128;

		this.args.static = false;

		this.breakable = false;

		this.args.decel = 0;
		this.args.accel = 0;
	}

	activate()
	{
		this.viewport.auras.add(this);

		this.args.launched = true;
	}

	update()
	{
		if(this.args.launched)
		{
			if(this.args.gSpeed < 1)
			{
				this.args.gSpeed = 1;
			}

			this.args.gSpeed += 0.1;

			const maxSpeed = Infinity;
			// const maxSpeed = 25;

			if(this.args.gSpeed > maxSpeed)
			{
				this.args.gSpeed = maxSpeed;
			}
		}

		super.update();
	}

	collideA(other, type)
	{
		if(!this.breakable)
		{
			return true;
		}

		return super.collideA(other, type);
	}
}
