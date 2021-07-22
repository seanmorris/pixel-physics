import { Bindable } from 'curvature/base/Bindable';
import { Sheild } from './Sheild';

export class BubbleSheild extends Sheild
{
	template = `<div class = "sheild bubble-sheild [[bouncing]]"><div class = "bubble-sheild-shine"></div></div>`;
	protect = true;
	type = 'water';

	acquire(host)
	{
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		const invertDamage = event => {

			if(host.args.currentSheild !== Bindable.make(this))
			{
				return;
			}

			event.preventDefault();

			const other = event.detail.other;

			other && other.pop && other.pop(host);

			this.onNextFrame(() => {
				host.args.currentSheild = null;
				host.inventory.remove(this)
			});

			host.removeEventListener('damage', invertDamage);

			host.startle();
		};

		host.addEventListener('damage', invertDamage);
	}

	command_0(host, button)
	{
		if(host.canFly || host.dashed)
		{
			return;
		}

		if(host.args.standingOn && host.args.standingOn.isVehicle)
		{
			return;
		}

		this.args.force = 10;

		if(host.args.jumping)
		{
			host.impulse(14, Math.PI / 2);

			this.args.bouncing = 'bouncing';
			host.args.bouncing = true;
		}
	}

	hold_0()
	{
		if(this.args.bouncing && this.args.force < 25)
		{
			this.args.force++;
		}
	}

	update(host)
	{
		if(host.args.ySpeed < -5)
		{
			this.onNextFrame(() => host.args.bouncing = false);
		}

		if(!this.sample)
		{
			this.initSample = new Audio('/Sonic/S3K_3F.wav');
			this.initSample.volume = 0.15 + (Math.random() * -0.05);

			this.sample = new Audio('/Sonic/S3K_44.wav');
			this.sample.volume = 0.15 + (Math.random() * -0.05);

			if(host.viewport.args.audio)
			{
				this.initSample.play();
			}
		}

		if(host.canFly)
		{
			return;
		}

		if(!host.public.falling)
		{
			if(this.args.bouncing)
			{
				host.args.gSpeed = 0;

				this.onNextFrame(()=>{
					host.args.standingOn = null;
					host.args.bouncing = false;
					host.args.falling  = true;
					host.args.jumping  = true;
					host.args.ySpeed   = -this.args.force;
				});

				this.args.bouncing = '';

				if(host.viewport.args.audio)
				{
					this.sample.currentTime = 0;
					this.sample.play();
				}

				host.controller.rumble({
					duration: 200,
					strongMagnitude: 1.0,
					weakMagnitude: 1.0
				});

			}

		}
	}
}
