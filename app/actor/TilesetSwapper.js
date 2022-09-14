import { PointActor } from './PointActor';

import { ScreenFire } from '../effects/ScreenFire';
import { BackdropPalette } from '../BackdropPalette';

export class TilesetSwapper extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.hidden = true;

		const img = new Image('../Sonic/tiles/azure-lake/azure-lake-burnt.png');

		const backdropClass = BackdropPalette[ this.args.backdrop ];

		this.args.backdrop = new backdropClass;
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

			const fire = new ScreenFire;

			this.viewport.args.screenEffects.add(fire);

			this.viewport.onFrameOut(60 * 6, () => {
				this.viewport.args.screenEffects.remove(fire);
				fire.remove();
			});

			this.viewport.onFrameOut(65, () => {
				this.viewport.tileMap.replacements.set(
					'/map/../Sonic/tiles/azure-lake/azure-lake.png'
					, '/map/../Sonic/tiles/azure-lake/azure-lake-burnt.png'
				);

				this.viewport.args.backdrop = this.args.backdrop;

				this.viewport.tileMap.replacements.set(
					'/map/../Sonic/tiles/azure-lake/azure-lake-shapes.png'
					, '/map/../Sonic/tiles/azure-lake/azure-lake-burnt-shapes.png'
				);

				this.viewport.tileMap.replacements.set(
					'/map/../Sonic/tiles/azure-lake/rolling.png'
					, '/map/../Sonic/tiles/azure-lake/rolling-burnt.png'
				);

				this.viewport.tileMap.replacements.set(
					'/map/../Sonic/tiles/azure-lake/giant-loop.png'
					, '/map/../Sonic/tiles/azure-lake/giant-loop-burnt.png'
				);

				this.viewport.tileMap.replacements.set(
					'/map/../Sonic/azure-lake-platform.png'
					, '/map/../Sonic/azure-lake-platform-burnt.png'
				);
			});
		});
	}
}
