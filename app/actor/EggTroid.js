import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { CanPop } from '../mixin/CanPop';

export class EggTroid extends Mixin.from(PointActor, CanPop)
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-eggtroid';

		this.args.width  = 40;
		this.args.height = 25;

		this.args.float = -1;
		this.args.gravity = 0.5;

		this.args.phase = 'idle';
	}

	update()
	{
		if(!this.viewport || !this.viewport.actorIsOnScreen(this))
		{
			return;
		}

		const viewport = this.viewport;

		if(this.args.animation !== 'diving')
		{
			this.args.xSpeed = 0.8 * Math.sign(Math.sin(this.age / 60));
		}

		super.update();

		if(!this.viewport)
		{
			return;
		}

		const mainChar = viewport.controlActor;

		if(!mainChar)
		{
			this.args.phase = 'idle';
			return;
		}

		this.args.facing = this.args.xSpeed > 0 ? 'left' : 'right';

		this.args.float = -1;

		const downPoint = this.castRayQuick(128, Math.PI/2, [0,0], false) || 128;

		if(downPoint)
		{
			const actors = this.viewport.actorsAtLine(
				this.args.x
				, this.args.y
				, this.args.x
				, this.args.y + downPoint
			);

			const actorList = [...actors.keys()];

			if(actors.size && actorList.filter(a => a !== this && a.controllable && !a.args.dead).length)
			{
				console.log(actorList.filter(a => a !== this && a.controllable));
				this.args.animation = 'diving';
				this.args.xSpeed = 0;
				this.args.ySpeed = 6;
				this.args.float = 0;
			}
			else
			{
				// this.args.animation = 'idle';
			}
		}

		if(!this.args.falling)
		{
			this.pop();
		}

	}

	get solid() {return false}
	get rotateLock() {return true}
}
