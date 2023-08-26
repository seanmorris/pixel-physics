import { Block } from "./Block";
import { WindStone } from "./WindStone";

export class StoneAltar extends Block
{
	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.float     = -1;
		this.args.static    = true;
		this.args.hidden    = true;
		this.args.platform  = true;
		this.args.activated = false;
	}

	update()
	{
		super.update();

		this.args.active = false;

		for(const actor of this.standingUnder)
		{
			if(!(actor instanceof WindStone))
			{
				continue;
			}

			actor.args.inPlace = true;

			this.args.active = true;
		}
	}
}
