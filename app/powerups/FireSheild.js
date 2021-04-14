import { Sheild } from './Sheild';

export class FireSheild extends Sheild
{
	template = `<div class = "sheild fire-sheild [[boosted]]"></div>`;
	type = 'fire';

	command_0(host, button)
	{
		if(host.canFly)
		{
			return;
		}

		if(host.args.jumping)
		{
			host.impulse(6, host.args.facing === 'left' ? Math.PI : 0);
			host.willJump = true;
		}
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

			if(!this.args.boosted)
			{
				this.args.boosted = 'boosted';

				this.sample.currentTime = 0;
				this.sample.play();

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
		if(host.canFly)
		{
			return;
		}

		if((host.args.jumping || host.args.dashing) && host.args.falling)
		{
			host.impulse(1, 0);

			if(!this.args.boosted)
			{
				this.args.boosted = 'boosted';

				this.sample.currentTime = 0;
				this.sample.play();

				host.viewport.onFrameOut(15, () => this.args.boosted = '');
			}
		}
		else
		{
			this.args.boosted = '';
		}
	}
}
