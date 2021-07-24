import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { Constrainable } from '../mixin/Constrainable';

export class MiniMace extends Mixin.from(PointActor, Constrainable)
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 32;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-mini-mace';
	}

	collideB(other)
	{
		if(other.controllable)
		{
			other.damage();
		}
	}

	update(){}

	updateEnd()
	{
		if(!this.viewport.auras.has(this))
		{
			this.viewport.auras.add(this);
		}

		super.update();

		if(this.args._tiedTo.args.hitPoints)
		{
			this.setPos();
		}
		else
		{
			this.noClip = true;
		}

		super.updateEnd();
	}
}
