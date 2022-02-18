import { Vehicle } from './Vehicle';
import { Projectile } from './Projectile';
import { Tag } from 'curvature/base/Tag';

export class EggWalker extends Vehicle
{
	instructions = [];

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-egg-walker';

		this.args.width  = 32;
		this.args.height = 64;

		this.args.weight = 1500;

		this.removeTimer = null;

		this.args.gSpeedMax = 2.5;
		this.args.decel     = 0.05;
		this.args.accel     = 0.10;

		this.args.seatHeight = 48;
		this.args.jumpForce  = 12;

		this.args.skidTraction = 0.9;

		this.dustCount = 0;

		this.args.particleScale = 2;

		this.args.bindTo('falling', v => {

			if(v || !this.crouching || this.ySpeedLast < 8)
			{
				return;
			}

			this.viewport.args.shakeY = 7;
		});
	}

	onAttached()
	{
		this.box = this.findTag('div');

		this.sprite = this.findTag('div.sprite');
		this.backSprite = new Tag('<div class = "sprite-back sprite">');

		this.body = new Tag('<div class = "egg-walker-body">');
		this.sprite.appendChild(this.body.node);

		this.punch = new Tag('<div class = "egg-walker-punch">');
		this.sprite.appendChild(this.punch.node);

		this.legFront = new Tag('<div class = "egg-walker-leg">');
		this.sprite.appendChild(this.legFront.node);

		this.boostFront = new Tag('<div class = "egg-boost">');
		this.legFront.appendChild(this.boostFront.node);

		this.legBack = new Tag('<div class = "egg-walker-leg egg-walker-leg-back">');
		this.backSprite.appendChild(this.legBack.node);

		this.boostBack = new Tag('<div class = "egg-boost">');
		this.legBack.appendChild(this.boostBack.node);

		this.chair = new Tag('<div class = "egg-walker-chair">');
		this.backSprite.appendChild(this.chair.node);

		this.gun = new Tag('<div class = "egg-walker-gun">');
		this.backSprite.appendChild(this.gun.node);

		this.box.appendChild(this.backSprite.node);
	}

	update()
	{
		super.update();

		if(this.boosting)
		{
			this.args.type = 'actor-item actor-egg-walker egg-walker-boosting';

			if(this.args.ySpeed > 0)
			{
				this.args.ySpeed -= 1.25 * ((Math.sin(this.viewport.args.frameId / 10) + 0.9) / 2) + 0.5;
			}
		}
		else
		{
			this.args.type = 'actor-item actor-egg-walker';
		}

		this.boosting = false;

		if(this.yAxis > 0.55 && (!this.xAxis || (this.falling && this.args.ySpeed > 0)))
		{
			if(this.crouching)
			{
				this.args.y += 0.001;
				this.args.y -= 0.001;
			}

			if(this.args.falling && !this.crouching)
			{
				this.args.ySpeed += 4;
			}

			this.args.gSpeed = 0;

			this.args.animation = 'crouching';
			this.crouching = true;
			this.args.seatHeight = 30;
			this.args.height = 48;
		}
		else
		{
			if(!this.crouching)
			{
				this.args.y += 0.001;
				this.args.y -= 0.001;
			}

			this.crouching = false;

			this.args.seatHeight = 48;
			this.args.height = 64;

			if(this.args.falling)
			{
				this.args.animation = 'falling';
			}
			else if(Math.sign(this.args.gSpeed) === this.args.direction)
			{
				this.args.animation = 'walking';
			}
			else
			{
				this.args.animation = 'standing';
			}
		}
	}

	hold_0()
	{
		if(!this.args.falling && this.args.ySpeed < 0 || this.checkBelow(this.x, this.y+1))
		{
			return;
		}

		if(this.yAxis > 0.55)
		{
			return;
		}

		this.boosting = true;
	}

	hold_2()
	{
		if(this.shooting)
		{
			return;
		}

		let offset, trajectory, spotAngle;

		const direction   = Math.sign(this.args.direction);
		const groundAngle = this.args.groundAngle;

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

		offset = [32 * Math.cos(spotAngle), 120 * Math.sin(spotAngle)];

		// if(this.args.falling || this.args.crouching)
		// {
		// 	trajectory = 0;
		// 	offset = [-16 * direction, -96];
		// }

		const projectile = new Projectile({
			direction: this.public.direction
			, x: this.args.x + offset[0] + (this.args.xSpeed || this.args.gSpeed)
			, y: this.args.y + offset[1] - (this.crouching ? -20 : 0)
			, owner: this
			, xSpeed: this.args.xSpeed || this.args.gSpeed
			// , ySpeed: this.args.ySpeed
			, float:  10
		});

		projectile.impulse(8, trajectory + (direction < 0 ? Math.PI : 0), true);

		projectile.update();

		this.viewport.auras.add(projectile);
		this.viewport.spawn.add({object:projectile});

		this.box.setAttribute('data-shoot', 'true');

		this.shooting = true;

		this.viewport.onFrameOut(1, () => {
			this.box.setAttribute('data-shoot', 'false');
		});

		this.viewport.onFrameOut(6, () => {
			this.shooting = false;
		});
	}

	command_0()
	{
		 if(!this.crouching)
		 {
			super.command_0();
		 }

	}

	command_1()
	{
		if(this.punching)
		{
			return;
		}

		this.box.setAttribute('data-punch', 'true');
		this.punching = true;

		this.viewport.onFrameOut(12, () => {
			this.box.setAttribute('data-punch', 'false');
		});

		this.viewport.onFrameOut(25, () => {
			this.punching = false;
		});
	}

	get solid() { return !this.occupant; }
}
