import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { Constrainable } from '../mixin/Constrainable';

export class Magnet extends Mixin.from(PointActor, Constrainable)
{
	constructor(...args)
	{
		super(...args);

		this.args.gravity = 0.8;
		this.args.width  = 48;
		this.args.height = 28;
		this.args.type   = 'actor-item actor-magnet';
	}

	collideA(other, type)
	{
	}

	collideB(other)
	{
		if(other.controllable)
		{
			// other.startle();
		}
	}

	update()
	{
		super.update();

		this.setPos();
	}
}
