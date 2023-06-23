import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { Sfx } from '../audio/Sfx';

export class Herculad extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-herculad';

		this.args.width   = 32;
		this.args.height  = 32;
		this.args.gravity = 0.4;

		this.args.collected = false;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoAttr.get(this.box)['data-collected'] = 'collected';
	}

	collideA(other,type)
	{
		if(other.controllable)
		{
			if(!this.args.collected)
			{
				Sfx.play('DOOT_DOOT');

				this.viewport.args.inventory.push({
					tallyIcon: '/secret/herculad-icon.png'
					, icon: '/secret/herculad-icon.png'
					, points: 10000
					, id:   this.oid
				});
			}

			this.args.collected = 'collected';
		}

		super.collideA(other,type);
	}
}
