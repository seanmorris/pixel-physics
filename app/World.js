import { Bag } from 'curvature/base/Bag';
import { Bindable } from 'curvature/base/Bindable';

import { TileMap } from 'tileMap/TileMap';

export class World
{
	static globals = Bindable.make({});
	tileMap = new TileMap;

	constructor()
	{
		this.viewports = new Bag((i,s,a) => {
			switch(a)
			{
				case BAG.ITEM_ADDED:
					i.world = this;
					break;

				case BAG.ITEM_REMOVED:
					i.world = null;
					break;
			}
		});

		this.actors = new Bag((i,s,a) => {
			switch(a)
			{
				case BAG.ITEM_ADDED:
					i.world = this;
					break;

				case BAG.ITEM_REMOVED:
					i.world = null;
					break;
			}
		});
	}

	getOnScreenObjects(tolerance)
	{

	}

	update()
	{

	}
}
