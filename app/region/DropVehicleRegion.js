import { Region } from "./Region";
import { ObjectPalette } from '../ObjectPalette';


export class DropVehicleRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region drop-vehicle';

	}

	updateActor(other)
	{
		if(!other.controllable)
		{
			return;
		}

		if(other.isVehicle)
		{
			return;
		}

		if(!other.args.standingOn)
		{
			return;
		}

		other.args.standingOn = null;
	}
}
