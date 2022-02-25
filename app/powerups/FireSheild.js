import { Bindable } from 'curvature/base/Bindable';
import { Sheild } from './Sheild';

export class FireSheild extends Sheild
{
	template = `<div class = "sheild fire-sheild [[boosted]]"></div>`;
	protect = true;
	type = 'fire';

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

	immune(host, other, type = 'normal')
	{
		if(type === 'fire')
		{
			return true;
		}

		return false;
	}

	update(host)
	{
		if(!this.initSample)
		{
			this.initSample = new Audio('/Sonic/S3K_3E.wav');
			this.initSample.volume = 0.15 + (Math.random() * -0.05);

			this.sample = new Audio('/Sonic/S3K_43.wav');
			this.sample.volume = 0.15 + (Math.random() * -0.05);

			if(host.viewport.args.audio)
			{
				this.initSample.play();
			}
		}

		if(!host.args.falling)
		{
			this.power = 15;
		}
	}

	hold_4(host, button)
	{
		if(this.power <= 0)
		{
			return;
		}

		this.power--;

		if(host.canFly)
		{
			return;
		}

		if(host.args.falling)
		{
			host.impulse(1, Math.PI);

			if(!this.args.boosted)
			{
				this.args.boosted = 'boosted';

				if(this.sample)
				{
					this.sample.currentTime = 0;
					this.sample.play();
				}

				host.viewport.onFrameOut(15, () => this.args.boosted = '');
			}
		}
		else
		{
			this.args.boosted = '';
		}
	}

	hold_5(host, button)
	{
		if(this.power <= 0)
		{
			return;
		}

		this.power--;

		if(host.canFly)
		{
			return;
		}

		if(host.args.falling)
		{
			host.impulse(1, 0);

			if(!this.args.boosted)
			{
				this.args.boosted = 'boosted';

				if(this.sample)
				{
					this.sample.currentTime = 0;
					this.sample.play();
				}

				host.viewport.onFrameOut(15, () => this.args.boosted = '');
			}
		}
		else
		{
			this.args.boosted = '';
		}
	}
}
