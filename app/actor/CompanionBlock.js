import { MarbleBlock } from './MarbleBlock';

export class CompanionBlock extends MarbleBlock
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-marble-companion-block';

		this.args.density = this.args.density || 6;
	}

	update()
	{
		const tileMap = this.viewport.tileMap;

		if(!tileMap.getSolid(this.x + this.public.width / 2 * (this.public.pushed || 0), this.y))
		{
			this.args.xSpeed = this.public.pushed;
		}

		super.update();
	}
}

