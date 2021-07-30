import { Region } from "./Region";

export class BossRegion extends Region
{
	// static fromDef(objDef)
	// {
	// 	const width = objDef.width;
	// 	const height = objDef.height;
	// 	const x = objDef.x;
	// 	const y = objDef.y;

	// 	const obj = super.fromDef(objDef);

	// 	obj.args.width  = width;
	// 	obj.args.height = height;

	// 	// obj.args.x = x - width  / 2;
	// 	obj.args.y = y + height;

	// 	return obj;
	// }

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region boss';
	}

	updateActor(other)
	{
		// console.log(other);

		if(other.args.falling)
		{
			return;
		}

		if(!this.args._boss)
		{
			const boss = this.viewport.actorsById[ this.args.boss ];

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
