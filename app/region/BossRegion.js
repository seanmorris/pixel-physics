import { Region } from "./Region";

export class BossRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region boss';
		this.args.hidden = true;
	}

	updateActor(other)
	{
		if(other.args.falling)
		{
			return;
		}

		if(!this.args._boss)
		{
			const boss = this.viewport.actorsById[ this.args.boss ];

			if(!boss)
			{
				other.args.bossMode = false;
				return
			}

			if(!boss.args.hitPoints)
			{
				other.args.bossMode = false;
			}
			else
			{
				other.args.bossMode = true;
			}
		}

	}
}
