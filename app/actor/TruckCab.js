import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
// import { Sfx } from '../audio/Sfx';

export class TruckCab extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-truck-cab';

		this.args.width   = 49;
		this.args.height  = 51;
		this.args.gravity = 0.4;
		this.args.float   = -1;
		this.noClip = 1;

		this.args.driver = this.args.driver || null;
	}
}
