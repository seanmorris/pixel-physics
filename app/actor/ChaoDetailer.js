import { Block } from './Block';
import { Chao } from './Chao';

export class ChaoDetailer extends Block
{
	chaoStats = new WeakMap;

	updateEnd()
	{
		let found = false;

		if(this.viewport.collisions.has(this))
		for(const [other,type] of this.viewport.collisions.get(this))
		{
			if(type !== 0)
			{
				continue;
			}

			if(other.args.falling)
			{
				continue;
			}

			if(!(other instanceof Chao))
			{
				continue;
			}

			this.viewport.args.quickForm =
			JSON.stringify({name: other.args.name, alignment: other.args.alignment}, null, 4) + "\n"
			+ JSON.stringify(other.mood, null, 4) + "\n"
			+ JSON.stringify(other.traits, null, 4) + "\n"
			+ JSON.stringify(other.stats, null, 4);

			other.args.currentState = 'waiting';

			found = true;
		}

		if(!found)
		{
			this.viewport.args.quickForm = null;
		}

		super.update();
	}
}
