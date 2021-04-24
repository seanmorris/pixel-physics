import { Sheild } from './Sheild';

export class ElectricSheild extends Sheild
{
	template = `<div class = "sheild electric-sheild [[boosted]]"></div>`;
	type = 'electric';
	jumps = 3;

	command_0(host, button)
	{
		if(host.canFly)
		{
			return;
		}

		if(this.jumps > 0 && host.args.jumping)
		{
			host.args.ySpeed = 0;
			host.impulse(10, -Math.PI / 2);
			this.jumps--;

			this.args.boosted = 'boosted';

			this.onTimeout(250, () => this.args.boosted = '');

			if(host.viewport.args.audio)
			{
				this.sample.currentTime = 0;
				this.sample.play();
			}

			if(host.xAxis && Math.sign(host.xAxis) !== Math.sign(host.public.xSpeed))
			{
				host.args.xSpeed = 1 * host.xAxis;
			}
		}
	}

	update(host)
	{
		if(!this.sample)
		{
			this.initSample = new Audio('/Sonic/S3K_41.wav');
			this.initSample.volume = 0.15 + (Math.random() * -0.05);

			this.sample = new Audio('/Sonic/S3K_45.wav');
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
			this.jumps = 3;

			this.args.boosted = '';
		}
	}
}
