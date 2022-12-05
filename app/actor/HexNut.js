import { Block } from './Block';

import { Sfx } from '../audio/Sfx';

export class HexNut extends Block
{
	constructor(...args)
	{
		super(...args);

		this.args.maxClimb = this.args.maxClimb ?? 262;
		this.args.width    = 64;
		this.args.height   = 24;
		this.args.platform = 1;
		this.args.float    = -1;
		this.args.type     = 'actor-item actor-hex-nut';
		this.args.static   = 0;
		// this.args.gravity  = 0.20;
		this.args.spinning = 0;
		this.args.bouncing = 0;
		this.args.treadmill = true;
	}

	update()
	{
		this.args.treadmill = true;

		this.standingUnder.forEach(a => {
			if(Math.abs(a.args.gSpeed) > 16)
			{
				a.args.gSpeed = 16 * Math.sign(a.args.gSpeed);
			}
		});

		const maxClimb = this.originalY + -this.args.maxClimb;

		if(this.args.convey > 0)
		{
			if(this.getMapSolidAt(this.args.x, this.args.y + 1))
			{
				this.args.ySpeed = 0;
				this.args.treadmill = false;
				this.args.convey = 0;
			}
			else
			{
				this.args.y += 0.1 * this.args.convey;
			}
		}
		else if(this.args.convey < 0)
		{
			if(this.args.y <= maxClimb)
			{
				this.args.y = maxClimb;
				this.args.ySpeed = 0;
				this.args.treadmill = false;
				this.args.convey = 0;
			}
			else
			{
				this.args.y += 0.1 * this.args.convey;
			}
		}

		if(Math.abs(this.args.convey ) > 8)
		{
			this.standingUnder.forEach(a => a.args.x = this.args.x);
		}
		else
		{
			this.standingUnder.forEach(a => a.args.x += Math.sign(this.args.x - a.args.x));
		}

		super.update();
	}

	sleep()
	{
		this.args.y = this.originalY;
	}
}
