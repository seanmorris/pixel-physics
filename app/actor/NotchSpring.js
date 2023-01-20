import { PointActor } from './PointActor';
import { Block } from './Block';

import { Sfx } from '../audio/Sfx';

export class NotchSpring extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 8;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-notch-spring';
		this.noClip = true;
		this.args.float = -1;
		this.args.animation = 'idle'

		this.launching = new Set;
	}

	collideA(other)
	{
		if(!other.controllable || !other.args.falling)
		{
			return;
		}

		this.launching.add(other)

		this.args.animation = 'springing';

		Sfx.play('NOTCH_SPRING_HIT');

		this.viewport.onFrameOut(1, () => this.args.animation = 'idle');
	}

	updateEnd()
	{
		super.updateEnd();

		this.launching.forEach(other => {
			other.args.animation = 'flip';
			other.args.jumping = false;
			other.dashed = false;
			other.args.x += this.args.direction;

			other.impulse(12, (-Math.PI / 2) + (Math.PI / 4 * this.args.direction), true);

			other.args.xSpeed = 0;
			other.args.ySpeed = 0;
			other.args.ignore = 8;
			this.launching.delete(other);
		});
	}

	get solid() { return false; };
}
