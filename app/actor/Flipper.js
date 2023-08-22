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

		this.args.direction = this.args.direction || 1;

		this.args.power = this.args.power ?? 12;

		this.args.type = 'actor-item actor-flipper';

		this.args.bindTo('direction', v => this.args.type = v < 0
			? 'actor-item actor-flipper actor-flipper-right'
			: 'actor-item actor-flipper actor-flipper-left'
		);

		this.flipped = new WeakSet;
	}

	collideA(other, type)
	{
		if(other.y <= this.y - this.args.height)
		{
			return;
		}

		if(this.flipped.has(other))
		{
			return;
		}

		const leftBound = this.x - this.args.direction * this.args.width;

		other.args.rolling = true;

		other.willJump = false;

		// if(other.x < leftBound + (this.args.width / 3))
		// {
		// 	other.args.gSpeed = 2;
		// }

		if(other.buttons[0] && other.buttons[0].time === 1)
		{
			// const rounded = this.roundAngle(-other.args.groundAngle + -Math.PI/2, 16, true);
			const rounded = -other.args.groundAngle + -Math.PI/2;

			this.args.animation = 'flipping';

			other.args.xSpeed = 0;
			other.args.ySpeed = 0;
			other.args.gSpeed = 0;

			const flipFactor = ((other.x - leftBound) / this.args.width) * 0.5;
			const flipMagnitude = flipFactor * this.args.direction;

			other.impulse(this.args.power * flipMagnitude, rounded, true);

			const xImpulse = Number(Number(Math.cos(rounded) * 1).toFixed(3));
			const yImpulse = Number(Number(Math.sin(rounded) * 1).toFixed(3));

			other.args.y += -4;

			other.args.xSpeed  = xImpulse;
			other.args.ySpeed  = yImpulse;
			other.args.falling = true;

			this.viewport.onFrameOut(3, () => this.args.animation = 'unflipping');

			other.args.jumping = false;
			other.args.falling = true;

			this.flipped.add(other);

			this.viewport.onFrameOut(1, () => other.willJump = false);
			this.viewport.onFrameOut(3, () => other.args.jumping = false);
			this.viewport.onFrameOut(5, () => this.flipped.delete(other));

			return;
		}

		if(Math.abs(other.args.gSpeed) < 3)
		{
			other.args.gSpeed = Math.min(2, Math.abs(other.args.gSpeed) || 1)
				* Math.sign(other.args.gSpeed || this.args.direction);
		}
		else
		{
			other.args.gSpeed *= 0.5;
		}
	}
}
