import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';
import { Projectile } from '../actor/Projectile';

import { Monitor } from './Monitor';

import { RingMonitor } from './monitor/RingMonitor';

import { SheildFireMonitor } from './monitor/SheildFireMonitor';
import { SheildWaterMonitor } from './monitor/SheildWaterMonitor';
import { SheildElectricMonitor } from './monitor/SheildElectricMonitor';

export class ArrowSign extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.rotation = objDef.rotation;
		obj.args.height = objDef.height;

		return obj;
	}

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-arrow-sign';

		this.args.float  = this.args.float  ?? -1;
		this.args.static = this.args.static ?? true;

		this.args.width  = args.width  || 32;
		this.args.height = args.height || 64;
	}

	onRendered(event)
	{
		super.onRendered(event);

		if(this.headBox)
		{
			return;
		}

		this.headBox = new Tag('<div class = "arrow-sign-head-box">')
		this.post    = new Tag('<div class = "arrow-sign-post">')
		this.head    = new Tag('<div class = "arrow-sign-head">')

		this.sprite.appendChild(this.post.node);
		this.headBox.appendChild(this.head.node);
		this.sprite.appendChild(this.headBox.node);

		this.args.bindTo(['point', 'height'], (v,k) => {
			this.headBox.style({['--'+k]: v});
		});
	}

	get solid() { return false; }
}
