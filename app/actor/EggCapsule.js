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
		if(this.args.falling)
		{
			other.startle(this);
			return true;
		}

		if(!other.controllable || type !== 0)
		{
			return true;
		}

		if(this.triggered)
		{
			other.args.x += 0.1 * Math.sign(this.args.x - other.args.x);
			other.args.gSpeed = 0;
			this.args.active = true;
			return true;
		}
		else if(this.groundTime > 15 && type === 0 && !this.triggered)
		{
			other.args.ignore = 200;

			Sfx.play('WTF_BOOM');
			Bgm.fadeOut(1500);

			this.viewport.onFrameOut(107, () => {
				const explosionTag = document.createElement('div');
				explosionTag.classList.add('particle-huge-explosion');
				const explosion = new Tag(explosionTag);

				this.viewport.controlActor.screenLock = null;

				explosion.style({'--x': this.args.x, '--y': this.args.y});

				this.viewport.particles.add(explosion);

				this.viewport.onFrameOut(15, () => this.viewport.particles.remove(explosion));
			});

			this.viewport.onFrameOut(240, () => this.triggered = false);
			this.viewport.onFrameOut(117, () => other.args.ySpeed = -65);
			this.viewport.onFrameOut(115, () => other.startle(this));

			this.triggered = true;

			return true;
		}

		return true;
	}

	get solid() {return this.groundTime > 15};
}
