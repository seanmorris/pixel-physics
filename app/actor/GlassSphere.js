import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';

export class GlassSphere extends PointActor
{
	float = -1;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-glass-sphere';

		this.args.width  = 24;
		this.args.height = 24;

		this.ignores = new Map;

		this.broken = false;
	}

	collideA(other)
	{
		if(other.args.static || other.isRegion || this.ignores.has(other) || other.noClip)
		{
			return false;
		}

		if(this.broken)
		{
			return false;
		}

		this.args.type = 'actor-item actor-glass-sphere actor-glass-sphere-active';

		if(other.args.falling)
		{
			const xDiff = this.x - other.x;
			const yDiff = this.y - other.y;

			const speed = other.args.ySpeed >= 0 ? 11 : 7;

			const angle = Math.atan2(yDiff, xDiff);

			const otherRadius = other.args.width / 2;

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

		this.ignores.set(other, 30);

		this.onTimeout(30, () => {
			// this.args.hidden = true;
		});

		this.broken = true;

		if(Math.random() > 0.5)
		{
			Sfx.play('BREAK_GLASS_1');
		}
		else
		{
			Sfx.play('BREAK_GLASS_2');
		}

		const viewport = this.viewport;

		if(viewport.settings.rumble && other && other.controller && other.controller.rumble)
		{
			other.controller.rumble({
				duration: 30,
				strongMagnitude: 0.25,
				weakMagnitude: 1.0
			});

			this.onTimeout(30, () => {
				other.controller.rumble({
					duration: 30,
					strongMagnitude: 0.0,
					weakMagnitude: 1.0
				});
			});
		}
	}

	sleep()
	{
		this.broken = false;
		this.args.type = 'actor-item actor-glass-sphere'
	}

	get canStick() { return false; }
	get rotateLock() { return true; }
	get solid() { return !this.broken; }
}

