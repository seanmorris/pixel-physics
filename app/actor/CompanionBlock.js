import { MarbleBlock } from './MarbleBlock';
import { LavaRegion } from '../region/LavaRegion';

import { Sfx } from '../audio/Sfx';
import { Analytic } from '../lib/Analytic';

export class CompanionBlock extends MarbleBlock
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-marble-companion-block';

		this.played = false;

		this.args.density = this.args.density || 10;
	}

	collideA(other, type)
	{
		if(this.args.falling && other.y > 8 + this.y + -this.args.height)
		{
			// return false;
		}
		else if(this.args.falling && other.y > this.y - this.args.height)
		{
			// other.args.y = this.y - this.args.height
		}
		else if(this.args.falling && other.args.modeTime < 3)
		{
			other.args.gSpeed = 0;
		}

		return super.collideA(other, type);
	}

	update()
	{
		const preX = this.args.x;

		let isInLava = false;

		const regions = this.regions;

		let localDensity = 0, denseRegion = null;

		for(const region of regions)
		{
			if(region.args.density > localDensity)
			{
				localDensity = region.args.density;
				denseRegion = region;
			}

			this.args.y = Math.round(this.args.y);

			if(region instanceof LavaRegion)
			{
				isInLava = true;

				// if(this.args.height > 18)
				// {
				// 	this.args.height = 18;
				// }

				if(!this.played)
				{
					this.args.type = 'actor-item actor-marble-companion-block actor-marble-companion-block-dying';

					this.viewport.onFrameOut(80, () => {
						this.args.type = 'actor-item actor-marble-companion-block actor-marble-companion-block-dead';
						Sfx.play('PLAYER_DAMAGED');
					});


					if(typeof ga === 'function')
					{
						Analytic.report({
							eventCategory: 'companion-block',
							eventAction: 'pushed',
							eventLabel: `${this.viewport.args.actName}::${this.args.id}`
						});
					}

					this.played = true;
				}
			}
		}

		if(denseRegion && localDensity && this.args.density)
		{

			const thisBottom = this.args.y;
			const regionTop  = denseRegion.args.y + -denseRegion.args.height;
			const yDiff      = Math.min(this.args.height, thisBottom - regionTop);
			const pressure   = this.args.gravity * (localDensity / this.args.density) * (yDiff / this.args.height);

			this.args.ySpeed -= pressure;

			if(!this.args.falling)
			{
				this.args.y--;
				this.args.falling = true;
			}
		}

		super.update();

		if(isInLava)
		{
			if(this.fallTime < 100)
			{
				this.args.xSpeed = 0;
			}
			else
			{
				this.args.xSpeed = Math.sign(this.gSpeedLast || this.xSpeedLast);
			}
		}

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

