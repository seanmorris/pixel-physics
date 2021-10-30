import { PointActor } from './PointActor';

export class Flipper extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.width  = 64;
		this.args.height = 48;

		this.noClip = true;
		this.args.float = -1;

		this.args.power = this.args.power ?? 24;

		this.args.type = 'actor-item actor-flipper';

		this.flipped = new WeakSet;
	}

	collideA(other, type)
	{
		if(other.args.falling || this.flipped.has(other))
		{
			return;
		}

		const leftBound = this.x - (this.args.width / 2);

		other.args.rolling = true;

		other.willJump = false;

		other.args.gSpeed = 1;

		// if(other.x < leftBound + (this.args.width / 3))
		// {
		// 	other.args.gSpeed = 2;
		// }

		if(other.buttons[0] && other.buttons[0].time === 1)
		{
			const rounded = this.roundAngle(-other.args.groundAngle + -Math.PI/2, 16, true);

			this.args.animation = 'flipping';

			this.viewport.onFrameOut(3, () => this.args.animation = 'unflipping');

			other.args.xSpeed = 0;
			other.args.ySpeed = 0;
			other.args.gSpeed = 0;
			other.args.float  = 2;

			// other.args.jumping = true;
			other.args.falling = true;

			const flipFactor = (other.x - leftBound) / this.args.width;

			other.impulse(this.args.power * flipFactor, rounded, true);

			this.flipped.add(other);

			this.viewport.onFrameOut(5, () => this.flipped.delete(other));
		}
	}
}
