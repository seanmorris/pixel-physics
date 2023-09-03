import { MarbleBlock } from './MarbleBlock';
import { BarnacleTrap } from './BarnacleTrap';

import { Sfx } from '../audio/Sfx';

export class ToxicBarrel extends MarbleBlock
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-toxic-barrel';

		this.args.density = this.args.density || 9.5;

		this.played = false

		this.args.width  = 23;
		this.args.height = 32;
		this.args.weight = 0;
	}

	collideA(other, type)
	{
		if(other instanceof BarnacleTrap)
		{
			return false;
		}

		if(this.args.falling && other.pop)
		{
			this.pop();
		}

		if(this.args.animation === 'exploding')
		{
			other.damage && other.damage(this, 'explosion');
			other.pop    && other.pop(this);

			return false;
		}

		if(this.args.falling && other.args.modeTime < 3)
		{
			other.args.gSpeed = 0;
		}

		if(this.args.falling)
		{
			return false;
		}

		return super.collideA(other, type);
	}

	update()
	{
		if(this.args.animation === 'exploding')
		{
			this.args.float = -1;
			this.args.xSpeed = 0;
			this.args.ySpeed = 0;

			this.castRayQuick(32, 0, [0, -16]);
			this.castRayQuick(32, Math.PI, [0, -16]);
			this.castRayQuick(32, Math.PI/2, [0, -16]);
			this.castRayQuick(32, Math.PI/-2, [0, -16]);
		}

		super.update();

		if(!this.args.falling && this.ySpeedLast > 3)
		{
			this.pop();
		}
	}

	pop()
	{
		this.args.animation = 'exploding';

		const viewport = this.viewport;

		viewport.onFrameOut(20, () => viewport.actors.remove(this));

		if(!this.played)
		{
			Sfx.play('BARREL_EXPLODE');
			this.played = true;
		}
	}

	sleep()
	{
		this.args.x = this.def.get('x');
		this.args.y = this.def.get('y');

		this.ySpeedLast = 0;

		this.onNextFrame(() => {
			this.args.x = this.def.get('x');
			this.args.y = this.def.get('y');

			this.viewport.setColCell(this);

			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
			this.args.pushed = 0;
			this.args.float  = 0;
		});
	}

	get solid() { return !this.args.falling && !this.args.hangingFrom; }
}

