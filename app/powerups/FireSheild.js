import { Bindable } from 'curvature/base/Bindable';
import { Sheild } from './Sheild';
import { Sfx } from '../audio/Sfx';

export class FireSheild extends Sheild
{
	template = `<div class = "sheild fire-sheild [[boosted]]"></div>`;
	protect = true;
	type = 'fire';
	power = 15;

	acquire(host)
	{
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		if(host.controllable)
		{
			Sfx.play('FIRE_ACQUIRE');
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

			host.startle(other);
		};

		host.addEventListener('damage', invertDamage);
	}

	immune(host, other, type = 'normal')
	{
		if(type === 'fire' || type === 'projectile')
		{
			return true;
		}

		return false;
	}

	update(host)
	{
		if(!host.args.falling)
		{
			this.didBoost = false;
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
			// return;
		}

		if(host.args.falling)
		{
			host.impulse(1, Math.PI);

			if(!this.args.boosted)
			{
				this.args.boosted  = 'boosted';
				host.args.didBoost = true;

				Sfx.play('FIRE_DASH');

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
			// return;
		}

		if(host.args.falling)
		{
			host.impulse(1, 0);

			if(!this.args.boosted)
			{
				this.args.boosted = 'boosted';
				host.args.didBoost = true;

				Sfx.play('FIRE_DASH');

				host.viewport.onFrameOut(15, () => this.args.boosted = '');
			}
		}
		else
		{
			this.args.boosted = '';
		}
	}
}
