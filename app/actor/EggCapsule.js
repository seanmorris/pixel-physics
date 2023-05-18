import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';
import { Bgm } from '../audio/Bgm';
import { Tag } from 'curvature/base/Tag';

export class EggCapsule extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width   = 64;
		this.args.height  = 69;
		this.args.type    = 'actor-item actor-egg-capsule';
		this.args.gravity = 0.4;

		this.args.bindTo('falling', v => {
			if(!v) this.viewport.args.shakeY = 7;
		});

		this.triggered = false;
	}

	collideA(other, type)
	{
		if(!other.controllable)
		{
			return true;
		}

		if(this.groundTime > 15 && type === 0 && !this.triggered)
		{
			Sfx.play('WTF_BOOM');
			Bgm.fadeOut(1500);

			other.args.ignore = 110;

			other.args.x -= 0.1 * (this.args.x - other.args.x);
			other.args.gSpeed = 0;

			this.viewport.onFrameOut(107, () => {
				const explosionTag = document.createElement('div');
				explosionTag.classList.add('particle-huge-explosion');
				const explosion = new Tag(explosionTag);

				explosion.style({
					'--x': this.args.x
					, '--y': this.args.y
				});

				this.viewport.particles.add(explosion);

				this.viewport.onFrameOut(15, () => {
					this.viewport.particles.remove(explosion);
				});
			});

			this.viewport.onFrameOut(115, () => other.startle(this));
			this.viewport.onFrameOut(117, () => other.args.ySpeed = -45);

			this.triggered = true;

			this.viewport.onFrameOut(240, () => this.triggered = false);

			return true;
		}

		if(!other.controllable || !this.args.falling)
		{
			return true;
		}

		other.startle(this);

	}

	get solid() {return this.groundTime > 15};
}
