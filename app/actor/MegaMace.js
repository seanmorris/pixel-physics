import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { Constrainable } from '../mixin/Constrainable';
import { SkidDust } from '../behavior/SkidDust';

export class MegaMace extends Mixin.from(PointActor, Constrainable)
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 64;
		this.args.height = 64 - 12;
		this.args.type   = 'actor-item actor-mega-mace';

		this.behaviors.add(new SkidDust('particle-dust'));

		this.args.ropeLength = this.args._tiedTo ? this.args.ropeLength : 8;

		this.args.gravity = 0.8;
		this.alwaysSkidding  = true;
	}

	update()
	{
		if(!this.args.tiedTo)
		{
			super.update();
		}
	}

	updateEnd()
	{
		if(this.viewport && !this.viewport.auras.has(this))
		{
			this.viewport.auras.add(this);
		}

		if(this.args.tiedTo)
		{
			super.update();

			if(!this.args._tiedTo)
			{
				this.args._tiedTo = this.viewport.actorsById[ this.args.tiedTo ];
			}

			if(this.args.tiedTo && this.args._tiedTo.args.hitPoints)
			{
				this.setPos();
			}
			else
			{
				this.noClip = true;
			}
		}


		super.updateEnd();
	}

	collideA(other)
	{
		if(this.args._tiedTo && !this.args._tiedTo === other)
		{
			return false;
		}
	}

	collideB(other)
	{
		if(this.args._tiedTo && !this.args._tiedTo === other)
		{
			return false;
		}

		if(this.args.tiedTo && !this.args._tiedTo.args.hitPoints)
		{
			return;
		}

		if(other.controllable || other.damage)
		{
			other.damage();
		}
	}
}
