import { PointActor } from './PointActor';
import { BackdropPalette } from '../BackdropPalette';

export class BackdropController extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.hidden = true;
	}



	activate(other, button)
	{
		// this.viewport.tilemap.replacements.set(
		// 	this.args.original//'../Sonic/tiles/azure-lake/azure-lake.png'
		// 	, this.args.replacement//'../Sonic/tiles/azure-lake/azure-lake-burnt.png'
		// );


	}
}
