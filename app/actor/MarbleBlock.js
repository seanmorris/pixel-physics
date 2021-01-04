import { PointActor } from './PointActor';

export class MarbleBlock extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-block-marble';

		this.args.width  = 32;
		this.args.height = 32;

		this.hanging = 0;
	}

	update()
	{
		super.update();

		if(this.args.falling)
		{
			this.hanging = false;
		}
	}

	collideA(other, type)
	{
		super.collideA(other);

		if(type === 1 && other.args.gSpeed < 0)
		{
			return true;
		}

		if(type === 3 && other.args.gSpeed > 0)
		{
			return true;
		}

		if(type === 3 || type === 1)
		{
			if(other.args.falling)
			{
				return true;
			}

			if(!other.args.gSpeed || this.args.falling)
			{
				return true;
			}

			const speed = Math.abs(other.args.gSpeed);

			if(Math.abs(this.hanging) + speed > this.args.width)
			{
				other.args.gSpeed = other.args.direction;
			}
			else if(speed > 1)
			{
				other.args.gSpeed = 1 * other.args.direction;
			}

			this.args.direction = other.args.direction;

			const nextPos = this.findNextStep(other.args.gSpeed);

			if(nextPos[3])
			{
				return true;
			}
			else if(nextPos[2] === true)
			{
				this.hanging += other.args.direction;
				this.args.x += other.args.direction;
				return false;
			}
			else if(nextPos[0] || nextPos[1])
			{
				this.args.x += nextPos[0];
				this.args.y += nextPos[1];

				return false;
			}
		}

		return true;
	}

	get canStick() { return false; }
	get solid() { return true; }
	get rotateLock() { return true; }
}

