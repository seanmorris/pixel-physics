import { Vehicle } from './Vehicle';
import { Sfx } from '../audio/Sfx';

import { Tag } from 'curvature/base/Tag';

export class PogoSpring extends Vehicle
{
	quickDrop = true
	passPop   = true;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-pogo-spring';

		this.args.width  = 32;
		this.args.height = 32;

		this.removeTimer = null;

		this.args.gSpeedMax = 20;
		this.args.decel     = 0.45;
		this.args.accel     = 0.45;
		this.args.gravity   = 0.6;

		this.args.seatHeight = 16;
		this.args.seatForward = -2;

		this.args.skidTraction = 0.05;
		this.args.jumpForce = 8;

		this.dustCount = 0;

		this.args.particleScale = 2;

		this.args.started = false;
		this.args.cameraMode = 'locked';

		this.args.bound = 0;

		this.bindTo('occupant', (v,k,t,d,p) => {
			if(p&&!v) 
			{
				this.args.dead = true;
				this.args.gSpeed = 0;
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
			}
		});
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--bound'] = 'bound';

	}

	update()
	{
		if(!this.args.falling && !this.occupant)
		{
			this.args.dead = false;
		}

		if(this.occupant && !this.frameout && !this.args.falling)
		{
			this.args.height = 16 + this.occupant.args.height;
			this.args.bound = -Math.floor(this.ySpeedLast);

			this.frameout = this.viewport.onFrameOut(1, () => {
				this.args.falling = true;
				this.frameout = false;
	
				this.args.ySpeed = this.args.bound;
	
				if(this.args.ySpeed > -3)
				{
					this.args.ySpeed -= 3;
				}

				if(this.args.ySpeed > -13)
				{
					this.args.ySpeed -= 3;
				}
				
				if(this.args.ySpeed < -24)
				{
					this.args.ySpeed = -24;
				}
			});

			this.args.xSpeed *= 0.3;

			const xDir = this.xAxis || this.xSpeedLast;

			this.args.direction = Math.sign(xDir);
			this.args.facing = Math.sign(xDir) < 0 ? 'left' : 'right';

			Sfx.play('POGO_BOUNCE');
		}
		else if (!this.occupant)
		{
			this.args.gSpeed = 0;
			this.args.xSpeed = 0;
		}

		if(!this.occupant)
		{
			this.args.height = 32;
			this.args.bound = -4;
		}

		this.noClip = this.args.dead;
		
		super.update();
	}

	collideA(other, type)
	{
		if(other instanceof PogoSpring)
		{
			return;
		}

		if(other.args.falling && other.args.ySpeed > 0)
		{
			this.args.bound = -other.args.ySpeed;
		}

		super.collideA(other, type);
	}

	sleep()
	{
		this.args.x = this.def.get('x');
		this.args.y = this.def.get('y');

		this.viewport.setColCell(this);

		this.args.dead = false;

		this.args.gSpeed = 0;
		this.args.xSpeed = 0;
		this.args.ySpeed = 0;

		this.args.bound  = 0;

		super.sleep();
		
		this.args.facing = 'right';
	}

	// wakeUp()
	// {
	// 	this.args.x = this.def.get('x');
	// 	this.args.y = this.def.get('y');

	// 	this.args.dead = false;

	// 	this.args.gSpeed = 0;
	// 	this.args.xSpeed = 0;
	// 	this.args.ySpeed = 0;

	// 	this.args.bound  = 0;

	// 	super.sleep();

	// 	this.args.facing = 'right';

	// 	if(!this.args.falling && !this.occupant)
	// 	{
	// 		this.args.dead = false;
	// 	}

	// 	super.wakeUp();
	// }

	get solid() { return !this.occupant; }
	get rotateLock() { return true; }
}
