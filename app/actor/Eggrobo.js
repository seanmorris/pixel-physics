import { PointActor } from './PointActor';
import { Projectile } from './Projectile';

import { Tag } from 'curvature/base/Tag';

export class Eggrobo extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.controllable   = true;

		this.args.type      = 'actor-item actor-eggrobo';

		this.args.accel     = 0.125;
		this.args.decel     = 0.3;

		this.args.gSpeedMax = 20;
		this.args.jumpForce = 13;
		this.args.gravity   = 0.60;

		this.args.width  = 48;
		this.args.height = 64;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');


		this.flame = new Tag('<div class = "eggrobo-flame">');
		this.muzzleFlash = new Tag('<div class = "eggrobo-muzzle-flash">');

		this.sprite.appendChild(this.flame.node);
		this.sprite.appendChild(this.muzzleFlash.node);
	}

	update()
	{
		const falling = this.args.falling;

		if(this.viewport.args.audio && !this.shootingSample)
		{
			this.shootingSample = new Audio('/Sonic/shot-fired.wav');
			this.thrusterSound = new Audio('/Sonic/mecha-sonic-thruster.wav');

			this.thrusterSound.loop = true;
		}

		if(this.thrusterSound.currentTime > 0.5)
		{
			this.thrusterSound.currentTime = 0.25;
		}

		this.thrusterSound.volume = 0.15 + (Math.random() * -0.10);

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(gSpeed === 0)
			{
				this.thrusterSound.pause();
				this.box.setAttribute('data-animation', 'standing');
			}
			else if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.thrusterSound.pause();
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(speed > maxSpeed / 2)
			{
				this.thrusterSound.pause();
				this.box.setAttribute('data-animation', 'running');
			}
			else
			{
				this.thrusterSound.pause();
				this.box.setAttribute('data-animation', 'walking');
			}
		}
		else
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		if(!this.args.falling)
		{
			this.args.flying = false;
		}

		if(this.args.flying)
		{
			this.box.setAttribute('data-animation', 'flying');
		}
		else if(this.args.falling)
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		if(this.args.shotCoolDown > 0)
		{
			this.args.shotCoolDown--;
		}

		if(this.args.rocketCoolDown == 0)
		{
			this.thrusterSound.pause();
		}

		if(this.args.rocketCoolDown > 0)
		{
			this.args.rocketCoolDown--;
		}

		if(this.args.rocketCoolDown == 0)
		{
			this.args.flying = false;
		}

		super.update();
	}

	get solid() { return true; }
	get isEffect() { return false; }

	command_0()
	{
		if(!this.args.falling)
		{
			this.args.rocketCoolDown = 5;

			super.command_0();

			return;
		}

		if(this.args.ySpeed > 1 || this.args.flying)
		{
			this.args.flying = true;

			if(this.args.rocketCoolDown <= 1)
			{
				this.thrusterSound.play();
				this.args.rocketCoolDown = 3;
			}

			this.args.ySpeed = 0;
			this.args.float  = 4;
		}
	}

	command_2()
	{
		if(this.args.shotCoolDown > 0)
		{
			return;
		}

		const direction  = Math.sign(this.args.direction);

		let offset, angle;

		switch(this.args.mode)
		{
			case 0:
				offset = [0, -36 - this.args.ySpeed];
				angle  = -this.args.angle;
				break;
			case 1:
				offset = [36, this.args.ySpeed];
				angle  = -this.args.angle + (Math.PI / 2);
				break;
			case 2:
				offset = [0, 42 - this.args.ySpeed];
				angle  = -this.args.angle + (Math.PI);
				break;
			case 3:
				offset = [-36, this.args.ySpeed];
				angle  = -this.args.angle + ((Math.PI / 2) * 3);
				break;
		}

		if(this.args.falling)
		{
			angle  = this.direction === -1 ? Math.PI : 0;
			offset = [0, -26];
		}

		const projectile = new Projectile({
			x: this.args.x + offset[0]
			, y: this.args.y + offset[1]
			, owner: this
		});

		projectile.impulse(75 * this.args.direction, angle);

		this.viewport.actors.add(projectile);
		this.box.setAttribute('data-shooting', 'true');

		this.onTimeout(140, () => {
			this.box.setAttribute('data-shooting', 'false');
		});

		if(this.viewport.args.audio && this.shootingSample)
		{
			this.shootingSample.volume = 0.6 + (Math.random() * -0.3);
			this.shootingSample.play();
		}

		this.args.shotCoolDown = 16;
	}

	get solid() { return false; }
}
