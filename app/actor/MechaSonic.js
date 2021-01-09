import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class MechaSonic extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.controllable = true;

		this.args.type = 'actor-item actor-mecha-sonic';

		this.args.accel = 0.4;
		this.args.decel = 0.3;

		this.args.gSpeedMax = 50;
		this.args.jumpForce = 15;
		this.args.gravity   = 0.65;

		// this.args.width = 32;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');
	}

	update()
	{
		const falling = this.args.falling;

		if(!this.box)
		{
			super.update();
			return;
		}

		this.args.accel = 0.3;

		const direction = this.args.direction;
		const gSpeed    = this.args.gSpeed;
		const speed     = Math.abs(gSpeed);
		const maxSpeed  = 100;
		const minRun    = 100 * 0.1;
		const minRun2   = 100 * 0.4;

		if(!this.flame)
		{
			this.sparks = new Tag('<div class = "mecha-sonic-sparks">');
			this.flame = new Tag('<div class = "mecha-sonic-flame">');

			this.sprite.appendChild(this.sparks.node);
			this.sprite.appendChild(this.flame.node);
		}

		if(!falling)
		{
			if(gSpeed === 0)
			{
				this.box.setAttribute('data-animation', 'standing');
			}
			else if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(speed >= minRun2)
			{
				this.box.setAttribute('data-animation', 'running2');

				this.args.accel = 0.75;

				if(speed > maxSpeed * 0.75)
				{
					this.args.accel = 0.01;
				}

			}
			else if(speed >= minRun)
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
			if(this.box.getAttribute('data-animation') !== 'jumping')
			{
				this.box.setAttribute('data-animation', 'curling');

				this.onTimeout(128, ()=>{
					if(this.args.falling)
					{
						this.box.setAttribute('data-animation', 'jumping');
					}
				});
			}
		}

		super.update();
	}

	get solid() { return true; }
	get isEffect() { return false; }
}
