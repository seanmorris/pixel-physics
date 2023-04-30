import { Spring } from '../actor/Spring';
import { OrbSmall } from '../actor/OrbSmall';
import { WoodenCrate } from '../actor/WoodenCrate';
import { SkidDust } from '../behavior/SkidDust';
import { Chao } from '../actor/Chao';

export class ChaoGarden
{
	update(frameId, viewport)
	{
		if(frameId === 0)
		{
			const zoneState = viewport.getZoneState();

			if(zoneState.chao)
			for(const chaoData of zoneState.chao)
			{
				const chao = new Chao;
				chao.load(chaoData);

				viewport.spawn.add({object:chao});
			}
		}

		// if(!viewport.controlActor)
		// {
		// 	return;
		// }

		// if(!frameId)
		// {
		// }
	}
}
