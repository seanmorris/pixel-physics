import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { SkidDust } from '../behavior/SkidDust';

export class Eggman extends PointActor
{
	static fromDef(objDef)
	{
		const instance = super.fromDef(objDef);

		instance.args.name = 'Robotnik'

		return instance;
	}

	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-eggman';

		this.accelNormal = 0.15;
		this.accelSuper  = 0.30;

		this.args.weight = 200;

		this.args.accel     = 0.15;
		this.args.decel     = 0.3;

		this.args.normalHeight = 40;
		this.args.rollingHeight = 32;

		this.gSpeedMaxNormal = 18;
		this.gSpeedMaxSuper  = 28;

		this.args.gSpeedMax = this.gSpeedMaxNormal;

		this.args.normalHeight = 57;
		this.args.rollingHeight = 29;

		this.jumpForceNormal = 11;
		this.jumpForceSuper  = 18;

		this.args.jumpForce = this.jumpForceNormal;
		this.args.gravity   = 0.5;

		this.args.width  = 18;
		this.args.height = 57;

		this.args.lookingUp = false;

		this.args.spriteSheet = this.spriteSheet = '/Sonic/eggman.png';

		this.superSpriteSheet = '/Sonic/eggman-super.png';
	}

	onAttached()
	{
		this.box = this.findTag('div');
	}

	update()
	{
		const falling = this.args.falling;

		if(!this.box)
		{
			super.update();
			return;
		}
		else if(this.yAxis > 0.5 && !this.args.ignore)
		{
			this.args.crouching = true;

			this.args.lookTime--;

			if(this.args.lookTime < -45)
			{
				this.args.cameraBias = -0.5;
			}
		}
		else if(this.yAxis < -0.5 && !this.args.ignore)
		{
			this.args.lookingUp = true;

			this.args.lookTime++;

			if(this.args.lookTime > 45)
			{
				this.args.cameraBias = 0.25;
			}
		}
		else
		{
			this.args.lookingUp = this.args.crouching = false;
		}

		const direction = this.args.direction;
		const gSpeed    = this.args.gSpeed;
		const speed     = Math.abs(gSpeed);
		const maxSpeed  = this.args.gSpeedMax;

		if(falling)
		{
			if(this.public.jumping)
			{
				this.box.setAttribute('data-animation', 'jumping');
			}
			this.args.height = this.public.rollingHeight;
		}
		else if(this.public.rolling)
		{
			this.args.height = this.public.rollingHeight;
			if(this.public.direction !== Math.sign(this.public.gSpeed))
			{
				this.args.direction = Math.sign(this.public.gSpeed);

				if(this.args.direction < 0)
				{
					this.args.facing = 'left';
				}
				else
				{
					this.args.facing = 'right';
				}
			}

			this.box.setAttribute('data-animation', 'rolling');
		}
		else
		{
			this.args.height = this.public.normalHeight;

			if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(speed > maxSpeed / 2)
			{
				this.box.setAttribute('data-animation', 'running');
			}
			else if(this.args.moving && gSpeed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else if(this.args.lookingUp)
			{
				this.box.setAttribute('data-animation', 'lookingUp');
			}
			else if(this.args.crouching || (this.args.standingOn && this.args.standingOn.isVehicle))
			{
				this.box.setAttribute('data-animation', 'crouching');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}

		super.update();
	}

	command_3()
	{
		this.isSuper = !this.isSuper;

		this.onTimeout(150, () =>{
			if(this.args.rings === 0)
			{
				// this.isSuper = false;
				this.setProfile();
			};
		});


		this.setProfile();
	}

	setProfile()
	{
		if(this.isSuper)
		{
			this.args.spriteSheet = this.superSpriteSheet;

			this.args.gSpeedMax = this.gSpeedMaxSuper;
			this.args.jumpForce = this.jumpForceSuper;
			this.args.accel     = this.accelSuper;
		}
		else
		{
			this.args.spriteSheet = this.spriteSheet;

			this.args.gSpeedMax = this.gSpeedMaxNormal;
			this.args.jumpForce = this.jumpForceNormal;
			this.args.accel     = this.accelNormal;
		}
	}


	get solid() { return false; }
	get canRoll() { return true; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
