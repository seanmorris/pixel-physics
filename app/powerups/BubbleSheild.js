import { Sheild } from './Sheild';

export class BubbleSheild extends Sheild
{
	template = `<div class = "sheild bubble-sheild [[bouncing]]"><div class = "bubble-sheild-shine"></div></div>`;
	type = 'water';

	command_0(host, button)
	{
		if(host.args.jumping)
		{
			host.impulse(14, Math.PI / 2);

			this.args.bouncing = 'bouncing';
		}
	}

	update(host)
	{
		if(!host.public.falling)
		{
			if(this.args.bouncing)
			{
				host.impulse(18, -Math.PI / 2, true);

				this.args.bouncing = '';
			}
		}
	}
}
