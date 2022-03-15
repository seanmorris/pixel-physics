import { Bindable } from 'curvature/base/Bindable';
import { View } from 'curvature/base/View';

export class Powerup extends View
{
	[ Bindable.NoGetters ] = true;
	equip(){}
	unequip(){}
	acquire(){}
	drop(){}
}
