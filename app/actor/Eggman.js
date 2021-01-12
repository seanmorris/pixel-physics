import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class Eggman extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.controllable   = true;

		this.args.type      = 'actor-item actor-eggman';

		this.args.accel     = 0.15;
		this.args.decel     = 0.3;

		this.args.gSpeedMax = 10;
		this.args.jumpForce = 12;
		this.args.gravity   = 0.6;

		this.args.width  = 48;
		this.args.height = 55;
	}

	onAttached()
	{
		this.box = this.findTag('div');
	}

	update()
	{
		const falling = this.args.falling;

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(gSpeed === 0)
			{
				this.box.setAttribute('data-animation', 'standing');
			}
			else if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(speed > maxSpeed / 2)
			{
				this.box.setAttribute('data-animation', 'running');
			}
			else
			{
				this.box.setAttribute('data-animation', 'walking');
			}
		}
		else
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		super.update();
	}

	get solid() { return false; }
	get isEffect() { return false; }
}
