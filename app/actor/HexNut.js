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

	// onRendered()
	// {
	// 	super.onRendered();

	// 	this.autoAttr.get(this.box)['data-spinning'] = 'spinning';
	// 	this.autoAttr.get(this.box)['data-bouncing'] = 'bouncing';
	// }

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

	// collideA(other, type)
	// {
	// 	if(other.args.falling
	// 		&& other.args.y > this.args.y + -this.args.height
	// 		&& other.args.y < this.args.y + -(this.args.height * 0.75)
	// 	){
	// 		other.args.y = this.args.y + -this.args.height;
	// 		return super.collideA(other, type);
	// 	}

	// 	if(!other.args.falling || other.args.ySpeed < 0)
	// 	{
	// 		return super.collideA(other, type);
	// 	}

	// 	// if(!other.controllable)
	// 	// {
	// 	// 	return super.collideA(other, type);
	// 	// }

	// 	this.args.ySpeed += Math.min(-4, -Math.abs(other.args.ySpeed) * 0.5);
	// 	this.args.float    = 10;
	// 	this.args.spinning = 30;
	// 	this.args.bouncing = 10;

	// 	other.args.xSpeed *= 0.5;
	// 	other.doubleSpin = false;

	// 	if(other.dashed)
	// 	{
	// 		other.dashed = false;
	// 		other.args.xSpeed = 0;
	// 		other.args.ySpeed = -other.args.airSpeed;
	// 		other.args.ySpeed *= 1.25;
	// 		this.args.ySpeed *= 1.75;
	// 	}
	// 	else
	// 	{
	// 		if(other.args.ySpeed > 0)
	// 		{
	// 			other.args.ySpeed = Math.min(-4, Math.max(-6, -Math.abs(other.args.ySpeed)));
	// 			other.args.ySpeed += this.args.ySpeed;
	// 		}

	// 		if(other.args.ySpeed > this.args.ySpeed)
	// 		{
	// 			other.args.ySpeed = this.args.ySpeed + -6;
	// 		}
	// 	}

	// 	Sfx.play('PROP_PLAT');

	// 	this.args.y--;
	// 	this.args.falling = true;

	// 	return super.collideA(other, type);
	// }
}
