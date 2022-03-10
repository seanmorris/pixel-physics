import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { Spring } from './Spring';
import { SkidDust } from '../behavior/SkidDust';

export class Seymour extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type = 'actor-item actor-seymour';

		this.args.spriteSheet = this.spriteSheet = '/secret/seymour-color-corrected.png';

		this.superSpriteSheet = '/secret/super-seymour.png';

		this.args.normalHeight = 44;
		this.args.rollingHeight = 23;

		this.args.accel     = 0.25;
		this.args.decel     = 0.4;

		this.args.gSpeedMax = 18;
		this.args.jumpForce = 11;
		this.args.gravity   = 0.5;

		this.args.width  = 18;
		this.args.height = 32;
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

		if(!falling)
		{
			this.springing = false;

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

			if(this.args.rolling)
			{
				this.args.animation = 'rolling';
			}
			else if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.args.animation = 'standing';
			}
			else if(speed > maxSpeed * 0.75)
			{
				this.args.animation = 'running';
			}
			else if(this.args.moving && gSpeed)
			{
				this.args.animation = 'walking';
			}
			// else if(this.args.crouching || (this.args.standingOn && this.args.standingOn.isVehicle))
			// {
			// 	this.box.setAttribute('data-animation', 'crouching');
			// }
			else
			{
				this.args.animation = 'standing';
			}
		}
		else if(this.args.jumping)
		{
			this.args.animation = 'jumping';
		}

		if(this.args.falling && this.springing)
		{
			this.args.groundAngle = 0;
			this.args.animation = 'springing';
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

			// this.args.gSpeedMax = this.gSpeedMaxSuper;
			// this.args.jumpForce = this.jumpForceSuper;
			// this.args.accel     = this.accelSuper;
		}
		else
		{
			this.args.spriteSheet = this.spriteSheet;

			// this.args.gSpeedMax = this.gSpeedMaxNormal;
			// this.args.jumpForce = this.jumpForceNormal;
			// this.args.accel     = this.accelNormal;
		}
	}

	collideA(other)
	{
		if(other instanceof Spring)
		{
			this.onNextFrame(()=>{
				if(!this.args.falling)
				{
					return;
				}
				this.springing = true;
				this.args.animation = 'springing';
			});
		}
	}

	get solid() { return false; }
	get canRoll() { return true; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
