import { ShadeRegion } from './ShadeRegion';

export class FgShadeRegion extends ShadeRegion
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

		this.args.type = 'fg-region-shade region region-shade';
	}
}
