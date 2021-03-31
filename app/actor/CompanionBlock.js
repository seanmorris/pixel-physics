import { MarbleBlock } from './MarbleBlock';

export class CompanionBlock extends MarbleBlock
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-marble-companion-block';

		this.args.density = 0.5;
	}

	update()
	{
		const tileMap = this.viewport.tileMap;

		if(this.public.float && !tileMap.getSolid(this.x + this.public.width / 2 * this.public.direction, this.y))
		{
			this.args.xSpeed = this.public.direction;
		}
		else
		{
			this.args.xSpeed = 0;
		}

		super.update();
	}
}

