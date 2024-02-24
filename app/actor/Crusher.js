import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { Constrainable } from '../mixin/Constrainable';
import { Block } from './Block';

export class Crusher extends Mixin.from(PointActor, Constrainable)
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 112;
		this.args.height = 24;
		this.args.type   = 'actor-item actor-crusher';
		// this.args.ropeLength = this.args._tiedTo ? this.args.ropeLength : 8;
		this.args.gravity = 0.8;
		// this.args.stay = true;
		// this.args.float = -1;
	}

	update()
	{
		if(!this.others.tiedTo)
		{
			super.update();
		}
	}

	updateStart()
	{
		super.update();

		const tiedTo = this.others.tiedTo;

		if(tiedTo)
		{
			this.setPos();
		}


		super.updateStart();
	}

	get solid() { return true; }
}
