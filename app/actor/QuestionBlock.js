import { PointActor } from './PointActor';

export class QuestionBlock extends PointActor
{
	maxBounce = 8;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-question-block';

		this.args.width  = 32;
		this.args.height = 32;
		this.args.float  = -1;

		this.initY = null;
	}

	collideA(other)
	{
		super.collideA(other);

		if(this.initY === null)
		{
			this.initY = this.y;
		}

		if(this.args.collType === 'collision-bottom')
		{
			const impulse = Math.abs(other.args.ySpeed);

			other.args.falling = true;

			if(other.args.ySpeed > 0)
			{
				other.args.ySpeed += this.args.ySpeed;
			}
			else
			{	this.args.y  -= impulse;
				other.args.y += impulse;
			}

			if(this.args.ySpeed > 0 && this.args.ySpeed > other.args.ySpeed)
			{
				other.args.ySpeed = Math.abs(other.args.ySpeed);
				other.args.y += this.args.ySpeed;
			}

			if(this.args.ySpeed < 0)
			{
				this.args.ySpeed = -Math.abs(this.args.ySpeed);
			}

			if(this.args.ySpeed)
			{
				return;
			}

			const ySpeedMax = this.maxBounce;

			let speed = -Math.abs(other.args.ySpeed);

			if(Math.abs(speed) > ySpeedMax)
			{
				speed = ySpeedMax * Math.sign(speed);
			}


			this.args.ySpeed = speed;
			other.args.ySpeed = -speed;
		}

		return true;
	}

	update()
	{
		if(this.initY !== null)
		{
			if(this.initY > this.y)
			{
				this.args.ySpeed += 1;
			}
			else if(this.initY < this.y)
			{
				this.args.ySpeed -= 1;
			}

			if(Math.abs(this.args.y - this.initY) < 1 && Math.abs(this.args.ySpeed) < 1)
			{
				this.args.ySpeed = 0;
				this.args.y = this.initY;
			}

		}

		this.args.ySpeed *= 0.9;

		this.args.ySpeed = Math.floor(this.args.ySpeed * 100) / 100;

		this.args.y = Math.round(this.args.y);

		const ySpeedMax = this.maxBounce;

		if(Math.abs(this.args.ySpeed) > ySpeedMax)
		{
			this.args.ySpeed = ySpeedMax * Math.sign(this.args.ySpeed);
		}

		super.update();
	}

	get canStick() { return false; }
	get solid() { return true; }
}
