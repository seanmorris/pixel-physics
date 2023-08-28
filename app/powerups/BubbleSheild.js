import { Bindable } from 'curvature/base/Bindable';
import { Sheild } from './Sheild';
import { Sfx } from '../audio/Sfx';

export class BubbleSheild extends Sheild
{
	template = `<div class = "sheild bubble-sheild [[bouncing]]"><div class = "bubble-sheild-shine"></div></div>`;
	protect = true;
	type = 'water';

	unequip(host)
	{
		super.unequip(host);

		host.args.bouncing = false;
		this.args.bouncing = false;
		this.args.force = 0;
	}

	acquire(host)
	{
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		if(host.controllable)
		{
			Sfx.play('WATER_ACQUIRE');
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
		if(type === 'water' || type === 'projectile')
		{
			return true;
		}

		return false;
	}

	command_0(host, button)
	{
		if(host.canFly && host.yAxis < 0.55)
		{
			return;
		}

		if(host.dashed)
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

		if(host.args.falling && host.yAxis)
		{
			return false;
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
			this.onNextFrame(() => {
				host.args.bouncing = false;
				this.args.bouncing = false;
				this.args.force = 0;
			});
		}

		// if(host.canFly)
		// {
		// 	return;
		// }

		if(!host.args.falling)
		{
			if(this.args.bouncing && this.args.force)
			{
				// host.args.gSpeed = 0;
				// host.args.xSpeed = 0;

				this.onNextFrame(()=>{
					host.args.standingOn = null;
					host.args.bouncing = false;
					host.args.falling  = true;
					host.args.jumping  = true;
					host.impulse(this.args.force, -Math.PI / 2, true);
				});

				this.args.bouncing = '';

				Sfx.play('WATER_BOUNCE');

				if(host.viewport.settings.rumble)
				{
					host.controller.rumble({
						duration: 200,
						strongMagnitude: 1.0,
						weakMagnitude: 1.0
					});
				}
			}
		}
	}
}
