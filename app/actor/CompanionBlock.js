import { MarbleBlock } from './MarbleBlock';
import { LavaRegion } from '../region/LavaRegion';

import { Sfx } from '../audio/Sfx';

export class CompanionBlock extends MarbleBlock
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-marble-companion-block';

		this.args.density = this.args.density || 9.5;

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
		let isInLava = false;

		for(const region of this.viewport.regionsAtPoint(this.args.x, this.args.y + 2))
		{
			if(region instanceof LavaRegion)
			{
				isInLava = true;

				if(this.args.height > 16)
				{
					this.args.height -= 0.5;
				}


				if(!this.played)
				{
					this.args.type = 'actor-item actor-marble-companion-block actor-marble-companion-block-dying';

					this.viewport.onFrameOut(80, () => {
						this.args.type = 'actor-item actor-marble-companion-block actor-marble-companion-block-dead';
						Sfx.play('PLAYER_DAMAGED');
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
		}

		const preX = this.args.x;

		super.update();

		if(this.args.pushed)
		{
			if(isInLava)
			{
				const tileMap = this.viewport.tileMap;

				const solid = tileMap.getSolid(this.x + this.args.width / 2 * (this.args.pushed || 0), this.y);

				if(!solid)
				{
					this.args.x = preX + this.args.pushed;
				}
				else
				{
					this.args.pushed = 0;
				}
			}
		}

		if(!isInLava)
		{
			this.args.height = 32;
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

