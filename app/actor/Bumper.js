import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';

export class Bumper extends PointActor
{
	float = -1;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-bumper';

		this.args.width  = 16;
		this.args.height = 16;

		this.ignores = new Map;
	}

	collideA(other)
	{
		if(other.args.static || other.isRegion || this.ignores.has(other) || other.noClip)
		{
			return;
		}

		this.args.type = 'actor-item actor-bumper actor-bumper-active';

		this.viewport.onFrameOut(3, () => this.args.type = 'actor-item actor-bumper');

		if(other.args.falling)
		{
			Sfx.play('BUMPER_BOUNCE');

			const xDiff = this.x - other.x;
			const yDiff = this.y - other.y;

			const speed = Math.max(other.args.ySpeed > 0 ? 14 : 7, Math.hypot(other.args.xSpeed, other.args.ySpeed));

			const angle = Math.atan2(yDiff, xDiff);

			const otherRadius = other.args.width / 2;

			other.args.x = this.x + -Math.cos(angle) * 10;
			other.args.y = this.y + -Math.sin(angle) * 10;

			other.args.xSpeed = -speed * Math.cos(angle);
			other.args.ySpeed = -speed * Math.sin(angle);

			other.args.ignore = other.args.ignore || 4;
		}
		else
		{
			other.args.gSpeed *= -1;

			if(Math.abs(other.args.gSpeed) < 7)
			{
				other.args.gSpeed = 7 * Math.sign(other.args.gSpeed);
			}
		}

		this.ignores.set(other, 8);

		if(this.viewport.settings.rumble && other && other.controller && other.controller.rumble)
		{
			other.controller.rumble({
				duration: 120,
				strongMagnitude: 1.0,
				weakMagnitude: 1.0
			});

			this.onTimeout(120, () => {
				other.controller.rumble({
					duration: 120,
					strongMagnitude: 0.0,
					weakMagnitude: 1.0
				});
			});
		}

	}

	get canStick() { return false; }
	get rotateLock() { return true; }
	get solid() { return true; }
}

