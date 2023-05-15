import { Bindable } from "curvature/base/Bindable";

export class TallyCounter
{
	constructor()
	{
		return Bindable.make(this);
	}

	multiplier = 1
	points     = 0;
	value      = 0;
	type       = TallyCounter.TYPE_LABEL;
	label      = '';
	icon       = '';
	items      = [];
	started    = 0;
	display    = 0;
	visible    = 0;
	index      = 0;
}

TallyCounter.TYPE_LABEL = 0;
TallyCounter.TYPE_ICONS = 1;
TallyCounter.TYPE_ITEMS = 2;
