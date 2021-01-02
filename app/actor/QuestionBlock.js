import { PointActor } from './PointActor';

export class QuestionBlock extends PointActor
{
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
			if(other.args.ySpeed > 0)
			{
				return true;
			}

			if(this.args.ySpeed)
			{
				return true;
			}

			const speed = other.args.ySpeed * 2;

			this.args.ySpeed = speed;

			const ySpeedMax = 11;

			if(Math.abs(speed) > ySpeedMax)
			{
				this.args.ySpeed = ySpeedMax * Math.sign(speed);
			}

			other.args.ySpeed *= -1;
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


			if(Math.abs(this.args.y - this.initY) < 1 && Math.abs(this.args.ySpeed) < 0.75)
			{
				this.args.ySpeed = 0;
				this.args.y = this.initY;
			}

		}

		super.update();

		this.args.ySpeed *= 0.9;
	}

	get canStick() { return false; }
	get solid() { return true; }
}
