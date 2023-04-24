import { Block } from './Block';

import { Sfx } from '../audio/Sfx';
import { Region } from '../region/Region';

export class SpinningFloat extends Block
{
	constructor(...args)
	{
		super(...args);

		this.hitBlocks = true;
		this.invertsBias = true;

		this.args.width    = 64;
		this.args.height   = 64;
		this.args.platform = 1;
		// this.args.float    = -1;
		this.args.type     = 'actor-item actor-spinning-float';
		this.args.static   = 0;
		this.args.gravity  = 0.40;
		this.args.spinning = 0;
		this.args.bouncing = 0;
		this.args.treadmill = true;
		this.args.particleScale = 1.25;

		this.lastConvey = 0;
	}

	collideA(other, type)
	{
		if(other.args.platform)
		{
			return false;
		}

		return super.collideA(other, type);
	}

	update()
	{
		super.update();

		this.args.moving = this.args.falling || this.args.gSpeed;

		let inWater = false, topWater = false;

		const topRegions = this.viewport.regionsAtPoint(this.args.x, this.args.y - 36)

		for(const region of this.regions)
		{
			if(region.isWater)
			{
				inWater = true;
			}
		}

		for(const region of topRegions)
		{
			if(region.isWater)
			{
				topWater = true;
			}
		}

		if(topWater)
		{
			this.args.ySpeed -= this.args.gravity;
			this.args.falling = true;

			if(this.args.ySpeed > 0)
			{
				this.args.ySpeed *= 0.95;
			}
		}

		const bob = 0.25 + 3.5 * Math.abs(this.args.convey / 20);

		if(inWater
			&& this.args.falling
			&& Math.abs(this.args.ySpeed) < bob
			&& (this.args.ySpeed > 0 || this.args.convey)
		){
			if((!topWater && this.args.ySpeed > 0) || (topWater && this.args.ySpeed < 0))
			{
				this.args.ySpeed = Math.sign(this.args.ySpeed) * bob;
			}
		}

		this.standingUnder.forEach(a => {

			a.args.xSpeed = this.args.xSpeed || this.args.gSpeed;

			if(a.xAxis && Math.abs(a.args.gSpeed) > 1)
			{
				if(!this.args.falling)
				{
					a.args.gSpeed *= 0.90;
				}
				else if(!inWater)
				{
					a.args.gSpeed *= 0.99;
				}
			}

			if(Math.abs(a.args.gSpeed) > 14)
			{
				a.args.gSpeed = 14 * Math.sign(a.args.gSpeed);
			}

			if(Math.abs(this.args.convey) > 8)
			{
				a.args.x = this.args.x;
			}
			else
			{
				if(a.groundTime < 2)
				{
					a.args.gSpeed = 0;
					a.args.xSpeed = 0;
					this.args.convey = 0;
				}

				if(Math.abs(this.args.x - a.args.x) < 1)
				{
					a.args.x = this.args.x;
				}

				a.args.x += 0.2 * (this.args.x - a.args.x);
			}
		});

		if(!this.args.falling && Math.abs(this.args.gSpeed) < Math.abs(this.args.convey))
		{
			this.args.gSpeed = this.args.convey;
			this.args.xSpeed = this.args.gSpeed;
		}
		else if(inWater)
		{
			if(!this.args.xSpeed && this.gSpeedLast)
			{
				this.args.xSpeed = this.gSpeedLast;
				this.gSpeedLast = 0;
			}

			if(topWater && this.getMapSolidAt(this.x, this.y+1))
			{
				this.args.y--;
			}

			if(Math.abs(this.args.xSpeed) < 8)
			{
				this.args.xSpeed += 0.005 * this.args.convey;
			}

			if(this.args.falling)
			{
				this.args.xSpeed *= 0.99;
			}
			else
			{
				this.args.gSpeed = this.args.xSpeed;
			}
		}
	}

	sleep()
	{
		this.args.y = this.originalY;
	}

	// get solid() { return true; }
}
