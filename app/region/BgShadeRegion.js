import { ShadeRegion } from './ShadeRegion';

export class BgShadeRegion extends ShadeRegion
{
	currentFilter = -1;

	filters = [
		'studio'
		, 'western'
		, 'heat'
		, 'hydro'
		, 'lava'
		, 'frost'
		, 'eight-bit'
		, 'corruption'
		, 'black-hole'
		, 'normal'
	];

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-shade bg-region-shade';
	}
}
