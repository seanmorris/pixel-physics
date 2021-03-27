import { Sheild } from './Sheild';

export class ElectricSheild extends Sheild
{
	template = `<div class = "sheild electric-sheild [[boosted]]"></div>`;
	type = 'electric';
	jumps = 3;

	command_0(host, button)
	{
		if(this.jumps > 0 && host.args.jumping)
		{
			host.args.ySpeed = 0;
			host.impulse(10, -Math.PI / 2);
			this.jumps--;

			this.args.boosted = 'boosted';

			this.onTimeout(250, () => this.args.boosted = '');
		}
	}

	update(host)
	{
		if(!host.public.falling)
		{
			this.jumps = 3;

			this.args.boosted = '';
		}
	}
}
