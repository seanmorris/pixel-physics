import { BreakableBlock } from './BreakableBlock'

export class Stopper extends BreakableBlock
{
	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-breakable-block actor-stopper';

		this.args.height = 16;
	}

	collideA(other, type)
	{
		if(this.broken)
		{
			return false;
		}

		if((!this.broken && type === 2) || Math.abs(other.args.ySpeed) > 20 && type === 0)
		{
			if(other.args.ySpeed > 0 || other.ySpeedLast > 0)
			{
				other.args.groundAngle = 0;
				other.args.x       = this.args.x;
				other.args.ySpeed  = Math.abs(other.args.gSpeed);
				other.args.falling = true;
				other.args.mode    = 0;

				this.break();

				return false;
			}

			return true;
		}
		else if((other.args.jumping && other.args.ySpeed > 0) || other.args.rolling)
		{
			other.args.x = this.args.x;
			other.args.y = this.args.y;

			this.viewport.onFrameOut(1, () => {
				other.args.groundAngle = 0;
				other.args.falling   = true;
				other.args.animation = 'rolling';
			});

			if(other.args.jumping)
			{
				other.args.xSpeed = 0;
				other.args.ySpeed = 0;

				other.args.ignore = 30;
				other.args.float  = 30;

				this.viewport.onFrameOut(30, () => {
					other.args.ySpeed = 10;
				});
			}

			return super.collideA(other,type)
		}

		return true;
	}
}
