import { PointActor } from './PointActor';

const Boosted = Symbol('Boosted');

export class Spinner extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-spinner';

		this.args.width  = 64;
		this.args.height = 24;

		this.args.direction = this.args.direction || 1;
	}

	update()
	{
		if(!this.sample)
		{
			this.sample = new Audio('/Sonic/S2_2B.wav');
		}
	}

	collideB(other)
	{
		if(other.args.gSpeed === 0)
		{
			// return;
		}

		if(other.args.falling || other[Boosted])
		{
			return;
		}

		this.viewport.onFrameOut(10, () => delete other[Boosted]);

		other[Boosted] = this;

		const toSpeed = this.args.toSpeed || 40;

		other.args.ignore = 2;
		other.args.direction = this.args.direction;
		other.args.facing = this.args.direction > 0 ? 'right' : 'left';

		other.args.gSpeed = Math.abs(other.args.gSpeed) > toSpeed
			? Math.abs(other.args.gSpeed) * this.args.direction
			: toSpeed * this.args.direction;

		if(this.viewport.args.audio && this.sample)
		{
			this.sample.currentTime = 0;
			this.sample.volume = 0.5 + (Math.random() / 2.5);
			this.sample.play();
		}
	}
}
