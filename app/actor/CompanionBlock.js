import { MarbleBlock } from './MarbleBlock';
import { LavaRegion } from '../region/LavaRegion';

export class CompanionBlock extends MarbleBlock
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-marble-companion-block';

		this.args.density = this.args.density || 9.5;

		this.sample = new Audio('/Sonic/S3K_35.wav');

		this.played = false
	}

	collideA(other, type)
	{
		if(this.args.falling && other.y > 8 + this.y + -this.args.height)
		{
			return false;
		}
		else if(this.args.falling && other.y > this.y - this.args.height)
		{
			other.args.y = this.y - this.args.height
		}
		else if(this.args.falling && other.args.modeTime < 3)
		{
			other.args.gSpeed = 0;
		}

		return super.collideA(other, type);
	}

	update()
	{
		if(this.public.pushed)
		{
			const tileMap = this.viewport.tileMap;

			if(!tileMap.getSolid(this.x + this.public.width / 2 * (this.public.pushed || 0), this.y))
			{
				if(this.args.falling)
				{
					this.args.x += this.public.pushed;
				}
			}
			else
			{
				this.args.pushed = 0;
			}
		}

		for(const region of this.regions)
		{
			if(!this.played && region instanceof LavaRegion)
			{
				this.onTimeout(50, () => {
					if(this.viewport.args.audio)
					{
						this.sample.volume = 0.15 + (Math.random() * -0.05);

						this.sample.play();
					}
				});

				if(typeof ga === 'function')
				{
					ga('send', 'event', {
						eventCategory: 'companion-block',
						eventAction: 'pushed',
						eventLabel: `${this.viewport.args.actName}::${this.args.id}`
					});
				}

				this.played = true;
			}
		}

		super.update();
	}

	sleep()
	{
		this.args.x = this.def.get('x');
		this.args.y = this.def.get('y');

		this.onNextFrame(() => {
			this.args.x = this.def.get('x');
			this.args.y = this.def.get('y');

			this.viewport.setColCell(this);

			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
			this.args.pushed = 0;
			this.args.float  = 0;
		});
	}
}

