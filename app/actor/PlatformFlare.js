import { PointActor } from './PointActor';
import { Block } from './Block';

import { Sfx } from '../audio/Sfx';

export class PlatformFlare extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 32;
		this.args.height = 8;
		this.args.power  = this.args.power || 18;
		this.args.type   = 'actor-item actor-platform-flare';
		this.args.static = 1;
	}

	collideA(other)
	{
		if(other.args.float || other.args.static)
		{
			return;
		}

		if(other.controllable && this.args.active)
		{
			other.damage(this, 'fire');
		}

		if((this.viewport.args.frameId / 60) % 3)
		{
			return;
		}

		this.args.active = true;
		this.viewport.onFrameOut(30, () => this.args.active = false);

		if(other instanceof Block)
		{
			Sfx.play('LID_POP');
			other.args.ySpeed = -this.args.power
			other.args.y += -1;
			other.args.falling = true;
		}
	}
}
