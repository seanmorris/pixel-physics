import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

export class DrillCar extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-drill-car';

		this.args.width  = 93;
		this.args.height = 48;

		this.removeTimer = null;

		this.args.gSpeedMax = 25;
		this.args.decel     = 0.3;
		this.args.accel     = 1.75;

		this.args.seatHeight = 30;

		this.args.skidTraction = 0.5;
	}

	collideA(other)
	{
		if(!other.controllable)
		{
			return false;
		}

		if(other.y >= this.y)
		{
			return false;
		}

		if(other.isVehicle)
		{
			return false;
		}

		return true;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');
		this.backSprite = new Tag('<div class = "sprite-back sprite">');

		this.drill = new Tag('<div class = "drill-car-tire drill-car-drill">');

		this.seat = new Tag('<div class = "drill-car-seat">');
		this.windsheild = new Tag('<div class = "drill-car-windsheild">');

		this.copterCap = new Tag('<div class = "drill-car-copter-cap">');
		this.copterBladeA = new Tag('<div class = "drill-car-copter-blade-a">');
		this.copterBladeB = new Tag('<div class = "drill-car-copter-blade-b">');

		this.frontWheelA = new Tag('<div class = "drill-car-tire drill-car-tire-front-a">');
		this.frontWheelB = new Tag('<div class = "drill-car-tire drill-car-tire-front-b">');

		this.backWheelA = new Tag('<div class = "drill-car-tire drill-car-tire-back-a">');
		this.backWheelB = new Tag('<div class = "drill-car-tire drill-car-tire-back-b">');

		this.sprite.appendChild(this.drill.node);
		this.backSprite.appendChild(this.copterCap.node);

		this.backSprite.appendChild(this.copterBladeA.node);
		this.backSprite.appendChild(this.copterBladeB.node);

		this.sprite.appendChild(this.windsheild.node);
		this.backSprite.appendChild(this.seat.node);

		this.sprite.appendChild(this.frontWheelA.node);
		this.backSprite.appendChild(this.frontWheelB.node);

		this.sprite.appendChild(this.backWheelA.node);
		this.backSprite.appendChild(this.backWheelB.node);

		this.box.appendChild(this.backSprite.node);
	}

	update()	{
		const falling = this.args.falling;

		if(this.viewport.args.audio && !this.flyingSound)
		{
			this.flyingSound = new Audio('/Sonic/drill-car-copter.wav');

			this.flyingSound.volume = 0.35 + (Math.random() * -0.2);
			this.flyingSound.loop   = true;
		}

		if(!this.flyingSound.paused)
		{
			this.flyingSound.volume = 0.25 + (Math.random() * -0.2);
		}

		if(this.flyingSound.currentTime > 0.2)
		{
			this.flyingSound.currentTime = 0.0;
		}


		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			this.flyingSound.pause();

			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(this.args.moving && speed > maxSpeed * 0.75)
			{
				this.box.setAttribute('data-animation', 'running');
			}
			else if(this.args.moving && speed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}
		else if(this.args.flying)
		{
			this.box.setAttribute('data-animation', 'flying');
		}
		else if(this.args.falling)
		{
			this.flyingSound.pause();
			this.box.setAttribute('data-animation', 'jumping');
		}

		if(this.args.copterCoolDown == 0)
		{
			if(this.args.ySpeed > 5)
			{
				this.flyingSound.pause();
		 		this.args.flying = false;
			}
		}
		else if(this.args.copterCoolDown > 0)
		{
			this.args.copterCoolDown--;
		}

		super.update();
	}

	command_0()
	{
		if(!this.args.falling)
		{
			this.args.copterCoolDown = 15;

			super.command_0();

			return;
		}

		if(this.args.copterCoolDown > 0)
		{
			return;
		}

		if(this.args.ySpeed > 1)
		{
			if(!this.args.flying)
			{
				this.flyingSound.play();
			}

			this.args.flying = true;

			if(this.args.copterCoolDown == 0)
			{
				this.args.copterCoolDown = 7;
			}

			this.args.ySpeed = -1;
			this.args.float  = 8;
		}
	}

	get solid() { return true; }
	get isVehicle() { return true; }
}
