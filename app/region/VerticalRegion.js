import { Region } from "./Region";

export class VerticalRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region vertical';
		this.args.hidden = true;
	}

	updateActor(other)
	{
		if(other.args.falling)
		{
			other.args.xSpeed = 0;
		}
	}
}
