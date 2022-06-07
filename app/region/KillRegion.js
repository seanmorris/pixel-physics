import { Region } from "./Region";

export class KillRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region kill';
		this.args.hidden = true;
	}

	updateActor(other)
	{
		if(other.controllable)
		{
			other.die();
		}
	}
}
