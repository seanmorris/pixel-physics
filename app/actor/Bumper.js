import { PointActor } from './PointActor';

export class Bumper extends PointActor
{
	float = -1;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-bumper';

		this.args.width  = 16;
		this.args.height = 16;

		this.ignores = new Map;

		this.sample = new Audio('/Sonic/S3K_AA.wav');
	}

	update()
	{
		super.update();

		for(const [key,val] of this.ignores)
		{
			this.ignores.set(key, -1 + val);

			if(val === 0)
			{
				this.ignores.delete(key);
			}
		}
	}

	collideA(other)
	{
		if(this.ignores.has(this.ignores))
		{
			this.ignores.set(other, 16);
			return;
		}

		if(other.args.falling)
		{
			if(this.viewport.args.audio)
			{
				this.sample.volume = 0.15 + (Math.random() * -0.05);
				this.sample.currentTime = 0;
				this.sample.play();
			}

			other.args.xSpeed *= -1;
			other.args.ySpeed *= -1;

			if(Math.abs(other.args.xSpeed) < 7)
			{
				other.args.xSpeed = 7 * Math.sign(other.args.xSpeed);
			}

			if(Math.abs(other.args.ySpeed) < 7)
			{
				other.args.ySpeed = 7 * Math.sign(other.args.ySpeed);
			}
		}
		else
		{
			other.args.gSpeed *= -1;

			if(Math.abs(other.args.gSpeed) < 7)
			{
				other.args.gSpeed = 7 * Math.sign(other.args.gSpeed);
			}
		}

		this.ignores.set(other, 16);
	}

	get canStick() { return false; }
	get rotateLock() { return true; }
	get solid() { return true; }
}

