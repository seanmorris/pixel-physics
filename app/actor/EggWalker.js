import { Vehicle } from './Vehicle';
import { Platformer } from '../behavior/Platformer';
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
		this.latchBooster = false;

		this.args.particleScale = 2;

		this.args.bindTo('falling', v => {

			if(v || !this.crouching || this.ySpeedLast < 8)
			{
				return;
			}

			this.viewport.args.shakeY = 7;
		});
	}

	onRendered(event)
	{
		super.onRendered(event);
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

		this.args.cameraMode = 'walker';

		if(this.boosting)
		{
			this.args.type = 'actor-item actor-egg-walker egg-walker-boosting';

			if(this.args.ySpeed > 0)
			{
				this.args.ySpeed -= ((Math.sin(this.viewport.args.frameId / 10) + 0.9) / 2) + 0.5;
			}
		}
		else
		{
			this.args.type = 'actor-item actor-egg-walker';
		}

		if(this.yAxis > 0.55)
		{
			this.latchBooster = false;
		}

		if(!this.latchBooster)
		{
			this.boosting = false;
		}

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
		const below = this.bMap('checkBelow', this.x, this.y + 1).get(Platformer);

		if(!this.args.falling && this.args.ySpeed < 0 || below)
		{
			return;
		}

		if(this.yAxis > 0.55)
		{
			this.latchBooster = false;
			return;
		}

		if(this.yAxis < -0.55)
		{
			this.latchBooster = true;
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
			direction: this.args.direction
			, x: this.args.x + offset[0] + (this.args.xSpeed || this.args.gSpeed)
			, y: this.args.y + offset[1] - (this.crouching ? -20 : 0)
			, owner: this
			, xSpeed: this.args.xSpeed || this.args.gSpeed || this.args.direction
			// , ySpeed: this.args.ySpeed
			, float:  0
			, strength: 2
		});

		if(!this.crouching)
		{
			projectile.impulse(4, trajectory + (direction < 0 ? Math.PI : 0), true);
			projectile.args.float = 6;
		}
		else
		{
			projectile.impulse(2, trajectory + (direction < 0 ? Math.PI : 0), true);
		}


		this.viewport.spawn.add({object:projectile});
		this.viewport.auras.add(projectile);

		projectile.update();

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
		this.latchBooster = false;

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

	command_4()
	{
		this.args.direction = -1;
		this.args.facing = 'left';
	}

	command_5()
	{
		this.args.direction = 1;
		this.args.facing = 'right';
	}

	get solid() { return !this.occupant; }
}
