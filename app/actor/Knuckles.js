import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { KnuxBomb } from './KnuxBomb';

export class Knuckles extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type      = 'actor-item actor-knuckles';

		this.args.accel     = 0.30;
		this.args.decel     = 0.4;

		this.args.gSpeedMax = 12;
		this.args.jumpForce = 16;
		this.args.gravity   = 1;

		this.args.width  = 32;
		this.args.height = 41;

		this.args.skidTraction = 1.7;

		this.punching = 0;
		this.punched  = false;

		this.beforePunch = 'standing';

		this.bombsDropped = 0;

		this.args.bindTo('falling', v => {

			if(v || !this.public.flying)
			{
				return;
			}

			if(this.public.mode === 1 || this.public.mode === 3)
			{
				this.args.climbing = true;

				this.args.gSpeed = 0;
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
			}
		});
	}

	onAttached()
	{
		this.box = this.findTag('div');
	}

	update()
	{
		if(this.public.mode === 0 || this.public.mode === 2)
		{
			this.args.climbing = false;
		}

		const falling = this.public.falling;

		if(!this.box)
		{
			super.update();
			return;
		}

		if(this.throwing && Date.now() - this.throwing > 160)
		{
			this.throwing = false;
			this.holdBomb = false;

			const bomb = new KnuxBomb({
				x: this.public.x
				, y: this.public.y - 16
				, owner: this
				, xSpeed: this.public.direction * 10 + (-1 + (Math.random() * 2))
				, ySpeed: Math.random() * -2
			});

			this.viewport.spawn.add({object: bomb});
		}

		if(this.punching && Date.now() - this.punching > 256)
		{
			this.punching = false;

			this.args.gSpeed = this.punchMomentum;
			this.punchMomentum = 0;
		}

		if(this.punching && Date.now() - this.punching > 128)
		{
			this.punchMomentum = this.public.gSpeed;
			this.args.gSpeed = 2 * Math.sign(this.public.gSpeed);
			this.punched = false;
		}

		if(!falling)
		{
			this.bombsDropped = 0;

			const direction = this.public.direction;
			const gSpeed    = this.public.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.public.gSpeedMax;

			if(this.public.flying)
			{
				this.args.flying = false;
				this.args.float  = 0;
			}

			this.args.knucklesFlyCoolDown = 15;

			this.args.flying = false;

			if(!this.public.rolling)
			{
				if(this.public.climbing)
				{
					if(this.yAxis < 0)
					{
						this.box.setAttribute('data-animation', 'climbing-up');

						if(Math.abs(this.args.gSpeed) < 4)
						{
							this.args.gSpeed -= this.public.mode === 1 ? 1 : -1;
						}
					}
					else if(this.yAxis > 0)
					{
						this.box.setAttribute('data-animation', 'climbing-down');

						if(Math.abs(this.args.gSpeed) < 4)
						{
							this.args.gSpeed += this.public.mode === 1 ? 1 : -1;
						}
					}
					else
					{
						this.box.setAttribute('data-animation', 'climbing');
						this.args.gSpeed = 0;
					}
				}
				else if(Math.sign(this.public.gSpeed) !== direction && Math.abs(this.public.gSpeed - direction) > 5)
				{
					this.box.setAttribute('data-animation', 'skidding');
				}
				else if(this.holdBomb)
				{
					this.box.setAttribute('data-animation', 'hold-bomb');
				}
				else if(this.throwing)
				{
					this.box.setAttribute('data-animation', 'throw-bomb');
				}
				else if(this.punching)
				{
					this.box.setAttribute('data-animation', 'punching');
				}
				else if(speed > maxSpeed * 0.75)
				{
					this.box.setAttribute('data-animation', 'running');
				}
				else if(this.public.moving && this.public.gSpeed)
				{
					this.box.setAttribute('data-animation', 'walking');
				}
				else
				{
					this.box.setAttribute('data-animation', 'standing');
				}
			}
			else
			{
				this.box.setAttribute('data-animation', 'rolling');
			}
		}
		else if(this.public.flying)
		{
			this.box.setAttribute('data-animation', 'flying');
		}
		else
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		if(this.public.flying)
		{
			if(this.yAxis > 0)
			{
				this.args.flying = false;
				return;
			}

			if(this.public.ySpeed > 0)
			{
				this.args.ySpeed = 0;
			}

			if(this.public.ySpeed < 1)
			{
				this.args.ySpeed += 1;
			}

			if(this.public.ySpeed > 1)
			{
				this.args.ySpeed -= 1;
			}

			if(this.xAxis)
			{
				this.args.flyDirection = Math.sign(this.xAxis);
			}

			this.args.direction = Math.sign(this.public.xSpeed);

			if(this.public.direction < 0)
			{
				this.args.facing = 'left';
			}
			else
			{
				this.args.facing = 'right';
			}

			if(this.public.flyDirection)
			{
				// console.log(this.public.flyDirection, Math.sign(this.args.xSpeed));

				if(Math.abs(this.args.xSpeed) < 16)
				{
					if(this.public.flyDirection !== Math.sign(this.public.xSpeed))
					{
						this.args.xSpeed += 0.15625 * Math.sign(this.public.flyDirection) * 4;
					}
					else
					{
						this.args.xSpeed += 0.15625 * Math.sign(this.public.flyDirection);
					}
				}
			}

			this.args.float = 3;

			this.willStick = true;
			this.stayStuck = true;
		}
		else if(this.public.mode % 2 === 0 || this.public.groundAngle)
		{
			this.willStick = false;
			this.stayStuck = false;
			this.args.flyDirection = 0;
		}

		// if(this.args.knucklesFlyCoolDown == 0 && this.args.ySpeed > 5)
		// {
		// 	this.args.flying = false;
		// }

		if(this.args.knucklesFlyCoolDown > 0)
		{
			this.args.knucklesFlyCoolDown--;
		}

		super.update();
	}

	dropBomb()
	{
		if(this.public.falling)
		{
			this.args.ySpeed = -8;
		}

		const bomb = new KnuxBomb({
			x: this.public.x
			, y: this.public.y - 16
			, owner: this
			, xSpeed: this.public.xSpeed
			, ySpeed: -3
		});;

		this.viewport.spawn.add({object: bomb});
	}

	release_0()
	{

	}

	command_0()
	{
		super.command_0();

		if(!this.public.falling)
		{
			return;
		}

		this.args.flying = true;
		this.args.xSpeed = 9 * this.public.direction;
		this.args.willJump = false;
	}

	command_1()
	{
		if(this.punching || this.throwing || this.public.climbing)
		{
			return;
		}

		this.beforePunch = this.box.getAttribute('data-animation');
		this.punching    = Date.now();
		this.punched     = true;
		this.args.ignore = 8;
	}

	release_1()
	{
		if(!this.punched)
		{
			// this.box.setAttribute('data-animation', this.beforePunch);
		}
	}

	command_2()
	{
		if(!this.public.ignore && this.public.falling && !this.public.flying && this.bombsDropped < 3)
		{
			this.dropBomb();

			this.bombsDropped++;

			return;
		}

		if(this.public.falling || this.public.climbing)
		{
			return;
		}

		if(Math.abs(this.args.gSpeed) > 3)
		{
			return;
		}

		if(this.punching || this.throwing)
		{
			return;
		}

		this.holdBomb = Date.now();
		this.args.ignore = -1;
		this.args.gSpeed = 0;
	}

	release_2()
	{
		if(this.public.falling || this.public.climbing)
		{
			return;
		}

		if(Math.abs(this.args.gSpeed) > 3)
		{
			return;
		}

		if(!this.holdBomb)
		{
			return;
		}

		this.args.ignore = 4;

		this.holdBomb = false;

		this.throwing = Date.now();
	}

	get solid() { return false; }
	get canRoll() { return !this.public.climbing; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
