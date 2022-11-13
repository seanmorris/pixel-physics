import { PointActor } from './PointActor';

export class DropCage extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 48;
		this.args.height = 40;
		this.args.type   = 'actor-item actor-drop-cage';
		this.args.float  = -1;

		this.holding = false;
	}

	collideA(other, type)
	{
		if(this.holding || !other.controllable)
		{
			return false;
		}

		if(type === -1 || type % 2 === 0)
		{
			const xDiff = Math.abs(other.args.x - this.args.x);

			other.args.xSpeed = 0;

			this.holding = other;

			other.args.ySpeed = 0;
			other.args.float  = -1;
			other.args.ignore = -1;

			this.dropDelay(other).then(() => {
				other.args.float  = 0;
				other.args.ignore = 5;
				this.ignores.set(other, 30);
				this.holding = false;
			});

			return false;
		}

		return true;
	}

	dropDelay(other)
	{
		let waitFor = false;

		if(this.args.waitFor)
		{
			waitFor = this.viewport.actorsById[this.args.waitFor];
		}

		if(!waitFor)
		{
			return new Promise(accept => this.viewport.onFrameOut(30, () => accept()));
		}

		return waitFor.dropDelay(other);
	}

	update()
	{
		super.update()

		if(this.holding)
		{
			const other = this.holding;
			const toX = this.x;
			const toY = -6 + this.y;
			const stepX = (toX + -other.args.x) / 3;
			const stepY = (toY + -other.args.y) / 3;

			if(Math.abs(other.args.x - toX) < 0.1)
			{
				other.args.x = toX;

				if(Math.abs(other.args.y - toY) < 0.1)
				{
					other.args.y = toY;
				}
				else
				{
					other.args.y += stepY;
				}
			}
			else
			{
				other.args.x += stepX;
			}
		}
	}

	get solid() { return !this.holding; }
}
