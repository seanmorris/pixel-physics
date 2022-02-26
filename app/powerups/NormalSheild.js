import { Bindable } from 'curvature/base/Bindable';
import { Sheild } from './Sheild';

export class NormalSheild extends Sheild
{
	template = `<div class = "sheild normal-sheild"></div>`;
	protect = true;
	type = 'normal';

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

			other && other.damage && other.damage(host);

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
		return false;
	}
}
