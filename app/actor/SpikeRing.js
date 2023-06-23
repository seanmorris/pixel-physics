import { PointActor } from './PointActor';

export class SpikeRing extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 64;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-spike-ring';
		this.args.float  = -1;
		this.oscMode = 0;
	}

	collideA(other)
	{
		if(other.controllable)
		{
			other.damage(this);
		}
	}

	update()
	{
		const speed = 1.75;

		if(this.oscMode)
		{
			this.args.y -= speed * Math.sign(this.args.y - this.objDef.y);

			if(Math.abs(this.args.y - this.objDef.y) < speed)
			{
				this.args.y = this.objDef.y;
				this.oscMode = 0;
			}
		}
		else
		{
			this.args.y -= speed * Math.sign(this.args.y - this.args.riseTo);

			if(Math.abs(this.args.y - this.args.riseTo) < speed)
			{
				this.args.y = this.args.riseTo;
				this.oscMode = 1;
			}
		}
	}
}
