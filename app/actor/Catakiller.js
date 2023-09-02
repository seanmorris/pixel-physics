import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { CanPop } from '../mixin/CanPop';

import { CatakillerSegment } from './CatakillerSegment';

export class Catakiller extends Mixin.from(PointActor, CanPop)
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-catakiller';

		this.args.width  = 16;
		this.args.height = 24;

		this.args.phase = 'idle';
		this.args.scootSpeed = this.args.scootSpeed || 2;
		this.args.segments   = this.args.segments   || 6;
		this.args.pauseTime  = this.args.pauseTime  || 45;
		this.args.phaseTime  = this.args.phaseTime  || 600;

		this.segments = [];
	}

	update()
	{
		if(this.segments.length < this.args.segments)
		{
			const segment = new CatakillerSegment({
				leader:   this.segments.length ? this.segments[this.segments.length - 1] : this,
				position: this.segments.length,
				following: true,
				head: this,
				x: this.args.x + 10 * (this.segments.length + 1),
				y: this.args.y,
				z: this.args.z - (this.segments.length + 1)
			});

			this.segments.push(segment);

			this.viewport.spawn.add({object:segment});
		}

		if(!this.viewport || !this.viewport.actorIsOnScreen(this))
		{
			super.update();
			return;
		}

		const viewport = this.viewport;

		const interval = this.args.phaseTime;
		const half = interval * 0.5;

		const scootInterval = 30

		const scoot     = this.age % scootInterval;
		const direction = this.age % interval < half ? 1 : -1;
		const phase     = this.age % half;
		const moveTime  = half - this.args.pauseTime;

		if(phase < moveTime)
		{
			if(scoot > scootInterval * 0.5)
			{
				this.args.gSpeed = this.args.scootSpeed * direction;
				this.args.animation = 'mouth-open';

				if(Math.round(this.args.gSpeed) !== 0)
				{
					this.args.facing = this.args.gSpeed > 0 ? 'left' : 'right';
				}
			}
			else
			{
				this.args.animation = 'mouth-closed';
				this.args.gSpeed = 0;
			}
		}
		else
		{
			this.args.animation = 'mouth-closed';
			this.args.gSpeed = 0;
		}

		super.update();
	}

	pop(...args)
	{
		if(this.segments)
		{
			this.segments.forEach(s => {
				s.args.popped = true;
				s.args.falling = true;
				s.args.xSpeed = 2 * -Math.sign(this.gSpeedLast) * (s.args.position - this.segments.length / 2);
				s.args.ySpeed = -14;

				if(!s.viewport)
				{
					return;
				}

				s.viewport.onFrameOut(160, () => s.noClip = true);
			});
		}

		super.pop(...args);
	}

	get solid() {return false}
	get rotateLock() {return true}
}
