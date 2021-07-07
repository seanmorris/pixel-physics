import { PointActor } from './PointActor';

export class Spinner extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-spinner';

		this.args.width  = 64;
		this.args.height = 24;
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
		const toSpeed = 38;

		other.args.ignore = 4;
		other.args.direction = 1;
		other.args.facing = 'right';

		other.args.gSpeed = other.args.gSpeed > toSpeed
			? other.args.gSpeed
			: toSpeed;

		if(this.viewport.args.audio && this.sample)
		{
			this.sample.currentTime = 0;
			this.sample.volume = 0.5 + (Math.random() / 2.5);
			this.sample.play();
		}
	}
}
