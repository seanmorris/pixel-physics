import { PointActor } from './PointActor';

export class ChainPull extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-chain-pull';

		this.args.width  = 31;
		this.args.height = 12;
		this.args.float  = -1;
		this.args.maxDrop = this.args.maxDrop || 280;
		this.args.pullTo  = this.args.pullTo || 96;
	}

	update()
	{
		for(const [type,hangers] of this.hanging)
		{
			for(const hanger of hangers)
			{
				this.viewport.auras.add(hanger);

				if(hanger.args.falling)
				{
					if(this.others.switch && this.others.switch.args.active)
					{
						if(Math.abs(hanger.args.ropeLength - this.args.pullTo) >= 2)
						{
							if(hanger.args.ropeLength < this.args.pullTo)
							{
								hanger.args.y -= 2 * Math.sign(hanger.args.ropeLength - this.args.pullTo);
							}

							hanger.args.ropeLength -= 2 * Math.sign(hanger.args.ropeLength - this.args.pullTo);
						}
					}
					else if(hanger.args.ropeLength < this.args.maxDrop)
					{
						hanger.args.ropeLength = this.castRayQuick(this.args.maxDrop, Math.PI/2, [0,0], false) || this.args.maxDrop;
					}
					else
					{
						hanger.args.ropeLength -= 2 * Math.sign(hanger.args.ropeLength - this.args.maxDrop);
					}
				}
			}
		}
	}

	wakeUp()
	{
		for(const [type,hangers] of this.hanging)
		{
			for(const hanger of hangers)
			{
				this.viewport.auras.add(hanger);
			}
		}
	}

	sleep()
	{
		for(const [type,hangers] of this.hanging)
		{
			for(const hanger of hangers)
			{
				this.viewport.auras.delete(hanger);
			}
		}
	}
}
