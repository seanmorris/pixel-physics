import { Sheild } from './Sheild';

export class FireSheild extends Sheild
{
	template = `<div class = "sheild fire-sheild"></div>`;
	type = 'fire';

	command_0(host, button)
	{
		if(host.canFly)
		{
			return;
		}

		if(host.args.jumping)
		{
			host.impulse(6, host.args.direction < 0 ? Math.PI : 0);
			host.willJump = true;
		}
	}

	hold_4(host, button)
	{
		if(host.canFly)
		{
			return;
		}

		if((host.args.jumping || host.args.dashing) && host.args.falling)
		{
			host.impulse(1, Math.PI);
		}
	}

	hold_5(host, button)
	{
		if(host.canFly)
		{
			return;
		}

		if((host.args.jumping || host.args.dashing) && host.args.falling)
		{
			host.impulse(1, 0);
		}
	}
}
