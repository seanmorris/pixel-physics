import { PointActor } from './PointActor';
import { Spikes } from './Spikes';

export class SpikesSmall extends Spikes
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-spikes actor-spikes-small';

		this.args.width  = args.width  || 32;
		this.args.height = args.height || 10;

		this.args.pointing = this.args.pointing || 0;

		this.hazard = true;
	}

	update()
	{
		super.update();

		if(this.viewport && this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/0A3H.wav');
		}
	}

	collideA(other, type)
	{
		if(this.args.broken)
		{
			return false;
		}

		if(other.isVehicle)
		{
			this.args.type = 'actor-item actor-spikes actor-spikes-small actor-spikes-broken';

			this.args.broken = true;

			this.args.float = 0;
			this.args.ySpeed = -8;
			this.noClip = true;

			this.args.gravity = 1;

			// other.args.gSpeed += -Math.sign(other.args.gSpeed) * 0.5;

			const gSpeed = other.args.gSpeed;

			other.args.gSpeed = 0.1;

			this.viewport.onFrameOut(8, () => other.args.gSpeed = gSpeed);

			if(this.sample)
			{
				this.sample.volume = 0.7 + (Math.random() * -0.2);
				this.sample.currentTime = 0.471;
				this.sample.play();
			}

			return false;
		}

		return super.collideA(other, type);
	}

	activate()
	{
		this.args.float = 0;
		this.noClip = true;
	}
}
