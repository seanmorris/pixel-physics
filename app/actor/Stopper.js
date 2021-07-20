import { BreakableBlock } from './BreakableBlock'

export class Stopper extends BreakableBlock
{
	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.height = 16;
	}

	collideA(other, type)
	{
		if(other.args.jumping && type === 0)
		{
			if(!this.broken)
			{
				other.args.x = this.args.x + 6;
				this.viewport.onFrameOut(3, () => {
					other.args.ySpeed = 3;
					other.args.x = this.args.x + 6;
					other.args.xSpeed = 0;
					other.args.ySpeed = 0;
					other.args.groundAngle = 0;
					other.args.falling = true;
					other.args.animation = 'rolling';
					other.args.ignore = 30;
					other.args.float  = 30;
					this.viewport.onFrameOut(30, () => {
						other.args.ySpeed = 10;
					});
				});
			}

			return super.collideA(other,type);
		}

		return true;
	}
}
