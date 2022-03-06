import { PointActor } from './PointActor';
import { Projectile } from './Projectile';

import { Tag } from 'curvature/base/Tag';

import { SkidDust } from '../behavior/SkidDust';

import { Sfx } from '../audio/Sfx';

export class Eggrobo extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-eggrobo';

		this.args.accel     = 0.125;
		this.args.decel     = 0.3;

		this.args.gSpeedMax = 14;
		this.args.jumpForce = 11;
		this.args.gravity   = 0.5;

		this.args.width  = 18;
		this.args.height = 57;
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
			this.thrusterSound = new Audio('/Sonic/mecha-sonic-thruster.wav');

			this.thrusterSound.loop = true;
		}

		if(this.thrusterSound)
		{
			if(this.thrusterSound.currentTime > 0.4 + (Math.random() / 10))
			{
				this.thrusterSound.currentTime = 0.05;
			}

			this.thrusterSound.volume = 0.2 + (Math.random() * -0.05);
		}

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			if(this.yAxis > 0)
			{
				this.args.crouching = true;
			}
			else
			{
				this.args.crouching = false;
			}

			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.thrusterSound && this.thrusterSound.pause();
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(speed > maxSpeed / 2)
			{
				this.thrusterSound && this.thrusterSound.pause();
				this.box.setAttribute('data-animation', 'running');
			}
			else if(this.args.moving && gSpeed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else if(this.args.crouching || (this.standingOn && this.standingOn.isVehicle))
			{
				this.box.setAttribute('data-animation', 'crouching');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}
		else
		{
			this.args.crouching = false;

			if(this.args.jumping)
			{
				this.box.setAttribute('data-animation', 'jumping');
			}
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
			this.thrusterSound && this.thrusterSound.pause();
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

	hold_0()
	{
		if(!this.args.falling)
		{
			this.args.rocketCoolDown = 5;

			return;
		}

		if(this.args.ySpeed > 1 || this.args.flying)
		{
			this.args.flying = true;

			if(this.args.rocketCoolDown <= 1)
			{
				this.thrusterSound && this.thrusterSound.play();
				this.args.rocketCoolDown = 3;
			}

			this.args.ySpeed = this.args.ySpeed * 0.999;
			this.args.float  = 3;
		}
	}

	hold_2()
	{
		if(this.args.shotCoolDown > 0)
		{
			return;
		}

		const direction   = Math.sign(this.args.direction);
		const groundAngle = this.args.groundAngle;

		let offset, trajectory, spotAngle;

		switch(this.args.mode)
		{
			case 0:
				spotAngle  = (-groundAngle - (Math.PI / 2)) + (Math.PI / 4 * direction);
				trajectory = (-groundAngle);
				break;
			case 1:
				spotAngle  = (-groundAngle) + (Math.PI / 4 * direction);
				trajectory = (-groundAngle + (Math.PI / 2));
				break;
			case 2:
				spotAngle  = (-groundAngle + (Math.PI / 2)) + (Math.PI / 4 * direction);
				trajectory = (-groundAngle) - (Math.PI);
				break;
			case 3:
				spotAngle  = (-groundAngle) - (Math.PI) + (Math.PI / 4 * direction);
				trajectory = (-groundAngle - (Math.PI / 2));
				break;
		}

		offset = [50 * Math.cos(spotAngle), 50 * Math.sin(spotAngle)];

		if(this.args.falling || this.args.crouching)
		{
			trajectory = 0;
			offset = [26 * direction, -26];
		}

		const projectile = new Projectile({
			direction: this.args.direction
			, x: this.args.x + offset[0] + (this.args.xSpeed || this.args.gSpeed)
			, y: this.args.y + offset[1]
			, owner: this
			, xSpeed: this.args.xSpeed || this.args.gSpeed
			, YSpeed: this.args.YSpeed
		});

		projectile.impulse(20, trajectory + (direction < 0 ? Math.PI : 0), true);

		projectile.update();

		this.viewport.auras.add(projectile);
		this.viewport.spawn.add({object:projectile});

		this.box.setAttribute('data-shooting', 'true');

		this.onTimeout(140, () => {
			this.box.setAttribute('data-shooting', 'false');
		});

		Sfx.play('SHOT_FIRED');

		this.args.shotCoolDown = 4;
	}

	get canFly() { return true; }
	get solid() { return false; }
	get controllable() { return true; }
}
