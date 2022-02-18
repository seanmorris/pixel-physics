import { BreakableBlock } from './BreakableBlock';

export class FakeEmerald extends BreakableBlock
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 64;
		this.args.height = 34;
		this.args.type   = 'actor-item actor-breakable-block actor-fake-emerald';
		this.args.z      = 128;
		this.args.float  = -1;

		this.breakable = false;
	}

	updateStart()
	{}

	update()
	{
		super.update();

		if(this.switch && this.switch.args.active)
		{
			this.breakable = true;
		}
	}

	collideA(other, type)
	{
		if(!this.breakable)
		{
			return true;
		}

		return super.collideA(other, type);
	}
}
