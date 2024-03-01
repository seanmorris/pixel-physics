import { Sfx } from '../audio/Sfx';
import { PointActor } from './PointActor';

export class BallSwitch extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = this.args.width  || 20;
		this.args.height = this.args.height || 32;
		this.args.type   = 'actor-item actor-ball-switch';
		this.args.z = 100;
		this.args.xShift = 0;
		this.args.timeout = this.args.timeout || -1;

		this.activeTimer = 0;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--xShift'] = 'xShift';
		this.autoStyle.get(this.box)['--yShift'] = 'yShift';
	}

	collideA(other)
	{
		const speed = other.args.gSpeed || other.args.xSpeed;

		this.args.xShift += speed * 1.5;

		if(Math.abs(this.args.xShift) > 10)
		{
			this.args.xShift = 10 * Math.sign(this.args.xShift);
		}

		this.args.yShift = 4 * Math.cos(this.args.xShift / 10);
	}

	sleep()
	{
		this.args.active = false;
	}

	update()
	{
		super.update();

		if(this.args.colliding)
		{
			return;
		}

		this.args.xShift *= 0.925;

		if(Math.abs(this.args.xShift) <= 1)
		{
			this.args.xShift = 0;
		}

		if(this.activeTimer > 0)
		{
			this.activeTimer--;

			if(!this.activeTimer)
			{
				this.args.active = false;
			}
		}

		if(Math.abs(this.args.xShift) > 6)
		{
			if(!this.args.active)
			{
				Sfx.play('BALL_SWITCH');
			}

			this.args.active = true;

			if(this.args.timeout > 0)
			{
				this.activeTimer = this.args.timeout;
			}
		}

		this.args.yShift = 4 * Math.cos(this.args.xShift / 12);
	}

	get solid() { return false; }
}
