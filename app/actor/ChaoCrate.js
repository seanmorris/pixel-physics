import { PointActor } from './PointActor';

import { BreakableBlock } from './BreakableBlock';
import { Egg } from './Egg';

export class ChaoCrate extends BreakableBlock
{
	constructor(...args)
	{
		super(...args);

		this.args.type   = 'actor-item actor-breakable-block actor-chao-crate';
		this.args.width  = 60;
		this.args.height = 60;
		this.args.static = false;
	}

	collideA(other, type)
	{
		if(type === 0 && other.controllable)
		{
			return true;
			// return super.collideA(other, type);
		}

		if(other.spindashCharge)
		{
			this.break();
			return true;
		}

		if(type === -1 && !other.args.gSpeed && !other.args.falling && other.controllable)
		{
			this.break();
			return false;
		}

		if(type !== 1 && type !== 3 || other.y <= this.y - this.args.height)
		{
			return true;
		}

		if(other.args.rolling || type === 2)
		{
			this.break();
			return false;
		}

		if(!this.viewport)
		{
			return false;
		}

		if(type === -1 || other.args.rolling)
		{
			return super.collideA(other, type);
		}

		return true;
	}

	break()
	{
		if(!this.broken)
		{
			for(let i = 0; i < 5; i++)
			{
				const egg = new Egg({x: this.x, y: this.y});

				this.viewport.spawn.add({object:egg});

				this.onNextFrame(() => {
					egg.args.falling = true;
					egg.args.xSpeed  = (-0.5 + Math.random()) * 6;
					egg.args.ySpeed  = -7;
				});
			}
		}

		super.break();

		this.viewport.onTimeout(1000, () => {
			this.viewport && this.viewport.actors.remove(this)
		});
	}
}
