import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { KnuxBomb } from './KnuxBomb';

import { SkidDust } from '../behavior/SkidDust';

export class Knuckles extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-knuckles';

		this.args.accel     = 0.25;
		this.args.decel     = 0.4;

		this.args.gSpeedMax = 18;
		this.args.jumpForce = 11;
		this.args.gravity   = 0.5;

		this.args.width     = 15;
		this.args.height    = 41;

		this.args.normalHeight = 41;
		this.args.rollingHeight = 23;

		this.punchTime = 0;
		this.punched  = 0;

		this.beforePunch = 'standing';

		this.bombsDropped = 0;

		this.sparks = new Set();

		this.args.bindTo('falling', v => {

			if(v || !this.public.flying)
			{
				return;
			}

			if(this.public.mode === 1 || this.public.mode === 2 || this.public.mode === 3)
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
		const falling = this.public.falling;

		if(!this.box)
		{
			super.update();
			return;
		}

		if(this.throwing && Date.now() - this.throwing > 320)
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

		this.readying = false;

		if(this.punchTime && Date.now() - this.punchTime > (this.willPunch ? 1536 : 512))
		{
			this.punchMomentum = 0;
			this.punchTime = false;
			this.willPunch = false;
			this.punching  = false;
			this.punched = 0;
		}

		if(this.punchTime && Date.now() - this.punchTime > 384)
		{
			this.readying = true;
		}

		if(this.punchTime && Date.now() - this.punchTime > 128)
		{
			this.punching = true;
		}

		this.willStick = false;
		this.stayStuck = false;

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
							this.args.direction = this.public.mode === 1 ? 1 : -1;
							this.args.gSpeed -= this.public.direction;
						}
					}
					else if(this.yAxis > 0)
					{
						this.box.setAttribute('data-animation', 'climbing-down');

						if(Math.abs(this.args.gSpeed) < 4)
						{
							this.args.direction = this.public.mode === 1 ? 1 : -1;
							this.args.gSpeed += this.public.direction;
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
				else if(!this.readying && this.punched)
				{
					if(this.punched % 2)
					{
						this.box.setAttribute('data-animation', 'jabbing');
					}
					else
					{
						this.box.setAttribute('data-animation', 'punching');
					}
				}
				else if(this.readying || this.willPunch)
				{
					this.box.setAttribute('data-animation', 'readying');
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

			if(this.args.grinding)
			{
				this.args.rolling = false;

				this.box.setAttribute('data-animation', 'grinding');
			}
		}
		else
		{
			if(this.public.flying)
			{
				this.box.setAttribute('data-animation', 'flying');
			}
			else if(this.public.jumping)
			{
				this.box.setAttribute('data-animation', 'jumping');
			}

			if(this.public.climbing)
			{
				this.args.ySpeed = 0;
				this.args.xSpeed = 0;
				this.args.ignore = 10;
				this.args.falling = false;
				this.box.setAttribute('data-animation', 'walking');
				this.args.groundAngle = 0;

				if(this.args.mode === 1)
				{
					this.args.x += -4;
				}
				else if(this.args.mode === 3)
				{
					this.args.x += 4;
				}

				this.args.mode = 0;
			}
		}

		if(this.public.flying)
		{
			if(this.yAxis > 0 || this.checkBelow(this.x,this.y))
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

			if(Math.abs(this.args.xSpeed) > 18)
			{
				this.args.xSpeed = 18 * Math.sign(this.args.xSpeed);
			}

			this.args.float = 3;

			this.willStick = true;
			this.stayStuck = true;

			this.args.groundAngle = 0;
		}
		else if(this.public.mode % 2 === 0 || this.public.groundAngle)
		{
			this.args.flyDirection = 0;
		}

		if(this.args.knucklesFlyCoolDown > 0)
		{
			this.args.knucklesFlyCoolDown--;
		}

		super.update();

		if(this.public.mode === 0 || this.public.mode === 2)
		{
			this.args.climbing = false;
		}

		if(this.args.grinding && !this.args.falling && this.args.gSpeed)
		{
			const sparkParticle = new Tag(`<div class = "particle-sparks">`);
			const sparkEnvelope = new Tag(`<div class = "envelope-sparks">`);

			sparkEnvelope.appendChild(sparkParticle.node);

			const sparkPoint = this.rotatePoint(
				-this.public.gSpeed * 1.75 * this.args.direction
				, 8
			);

			const flip = Math.sign(this.args.gSpeed);

			sparkEnvelope.style({
				'--x': sparkPoint[0] + this.x
				, '--y': sparkPoint[1] + this.y + Math.random * -3
				, 'z-index': 0
				, 'animation-delay': (-Math.random()*0.25) + 's'
				, '--xMomentum': Math.max(Math.abs(this.args.gSpeed), 4) * flip
				, '--flip': flip
				, '--angle': this.realAngle
				, opacity: Math.random() * 2
			});

			sparkEnvelope.particle = sparkParticle;

			this.viewport.particles.add(sparkEnvelope);

			this.sparks.add(sparkEnvelope);

			this.viewport.onFrameOut(30, () => {
				this.viewport.particles.remove(sparkEnvelope);
				this.sparks.delete(sparkEnvelope);
			});
		}

		if(this.sparks.size)
		{
			for(const spark of this.sparks)
			{
				const sparkPoint = this.rotatePoint(
					1.75 * this.args.direction
					, 8
				);

				spark.style({
					opacity: Math.random() * 2
					, '--x': sparkPoint[0] + this.x
					, '--y': sparkPoint[1] + this.y
				});
			}
		}
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
		super.release_0();
	}

	command_0()
	{
		super.command_0();

		if(!this.args.falling)
		{
			return;
		}

		this.args.flying = true;
		this.args.xSpeed = 9 * this.args.direction;
		this.args.willJump = false;
	}

	command_1()
	{
		if(this.punchTime && Date.now() - this.punchTime < 72)
		{
			this.punchMomentum = 0;
			this.args.ignore = 8;
			this.willPunch = false;
			this.punchTime = false;
			this.punched = 0;
			return;
		}

		this.willPunch = true;

		if(this.punchTime)
		{
			this.args.ignore = 15;
			this.args.gSpeed = 0;
			return;
		}

		this.punchMomentum = this.punchMomentum || this.args.gSpeed || (4 * this.args.direction);
		this.args.ignore = 15;
		this.args.gSpeed = 0;
	}

	release_1()
	{
		if(this.punchTime && Date.now() - this.punchTime < 96)
		{
			this.willPunch = false;
			this.punchMomentum = 0;
			this.punched = 0;
			return;
		}

		this.args.gSpeed = this.punchMomentum;

		this.punchTime = Date.now();

		this.willPunch = false;

		if(this.throwing || this.args.climbing)
		{
			return;
		}

		this.punched++;
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

		if(this.punchTime || this.throwing)
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

	setCameraMode()
	{
		if(this.args.climbing)
		{
			this.args.cameraMode = 'aerial';
		}
		else
		{
			super.setCameraMode();
		}
	}

	get solid() { return false; }
	get canRoll() { return !this.public.climbing; }
	get canFly() { return true; }
	get isEffect() { return false; }
	get controllable() { return !this.args.npc; }
}
