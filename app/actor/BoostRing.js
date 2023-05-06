import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';

export class BoostRing extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-boost-ring';

		this.args.width  = 16;
		this.args.height = 16;

		this.args.float  = -1;

		this.args.pointing = this.args.pointing ?? 0;
		this.args.power    = this.args.power    ?? 15;

		this.shooting = new Set;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--pointing'] = 'pointing';
	}

	collideA(other)
	{
		if(!other.controllable || this.shooting.has(other) || other.args.mercy > 120)
		{
			return;
		}

		other.args.rolling = true;
		other.args.jumping = true;
		other.dashed  = false;

		other.args.x = this.args.x;
		other.args.y = this.args.y;

		other.args.xSpeed = 0;
		other.args.ySpeed = 0;
		other.args.float  = 15;
		other.args.ignore = 15;
		other.args.cameraIgnore = 30;
		other.args.groundAngle = 0;
		other.args.cameraMode = 'boost-ring';
		other.args.angle = this.args.pointing;
		other.args.flying = false;

		this.shooting.add(other);

		this.viewport.onFrameOut(4, () => other.impulse(this.args.power, this.args.pointing, true));
		this.viewport.onFrameOut(2, () => Sfx.play('BOOST_RING'));
		this.viewport.onFrameOut(10, () => this.shooting.delete(other));
	}

	get solid() { return false; }
}
