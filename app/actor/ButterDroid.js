import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { CanPop } from '../mixin/CanPop';

export class ButterDroid extends Mixin.from(PointActor, CanPop)
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-butter-droid';

		this.args.width  = 24;
		this.args.height = 24;

		this.args.float = -1;
		this.args.gravity = 0;

		this.args.phase = 'idle';
	}

	update()
	{
		if(!this.viewport || !this.viewport.actorIsOnScreen(this))
		{
			return;
		}

		const viewport = this.viewport;

		this.args.xSpeed = 0.8 * Math.sign(Math.sin(this.age / 60));

		super.update();

		const mainChar = viewport.controlActor;

		if(!mainChar)
		{
			this.args.phase = 'idle';
			return;
		}

		this.args.facing = this.args.xSpeed > 0 ? 'left' : 'right';

		this.args.float   = -1;
	}

	get solid() {return false}
	get rotateLock() {return true}
}
