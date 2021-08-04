import { PointActor } from './PointActor';

import { ScreenFire } from '../effects/ScreenFire';

export class TilesetSwapper extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.hidden = true;

		const img = new Image('../Sonic/tiles/azure-lake/azure-lake-burnt.png');
	}

	activate(other, button)
	{
		// this.viewport.tilemap.replacements.set(
		// 	this.args.original//'../Sonic/tiles/azure-lake/azure-lake.png'
		// 	, this.args.replacement//'../Sonic/tiles/azure-lake/azure-lake-burnt.png'
		// );

		if(this.activated)
		{
			return;
		}

		this.activated = true;

		this.viewport.onFrameOut(15, () => {

			this.viewport.args.screenEffects.push(new ScreenFire);

			this.viewport.onFrameOut(45, () => {
				this.viewport.tileMap.replacements.set(
					'../Sonic/tiles/azure-lake/azure-lake.png'
					, '../Sonic/tiles/azure-lake/azure-lake-burnt.png'
				);
			});
		});
	}
}
