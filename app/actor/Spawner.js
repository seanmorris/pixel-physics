import { PointActor } from './PointActor';
import { ObjectPalette } from '../ObjectPalette';

export class Spawner extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 16;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-spawner';
	}

	activate()
	{
		if(!this.args.spawn || !this.args.point)
		{
			return;
		}

		const point = this.viewport.objDefs.get(this.args.point);
		const type  = ObjectPalette[ this.args.spawn ];

		// console.log(point, type);

		if(!point || !type)
		{
			return
		}

		const spawned = new type({x: point.x, y: point.y});

		for(const [property,value] of this.def)
		{
			if(property === 'point' || property === 'type')
			{
				continue;
			}

			spawned.args[ property ] = value;
		}

		spawned.args[ name ] = this.args.spawn;

		this.viewport.spawn.add({object:spawned});
	}

	get solid() { return false; }
}
