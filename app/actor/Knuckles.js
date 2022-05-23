import { PointActor } from './PointActor';
import { Platformer } from '../behavior/Platformer';
import { Tag } from 'curvature/base/Tag';

import { KnuxBomb } from './KnuxBomb';

import { Spring } from './Spring';
import { SkidDust } from '../behavior/SkidDust';

export class Knuckles extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.canonical = 'Knuckles';

		window.knuckles = this;

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-knuckles';

		this.jumpForceNormal = 9.5;
		this.jumpForceSuper  = 10;

		this.accelNormal = 0.15;
		this.accelSuper  = 0.22;

		this.args.accel     = this.accelNormal;
		this.args.decel     = 0.4;

		this.args.weight    = 150;

		this.args.gSpeedMax = 18;
		this.args.jumpForce = this.jumpForceNormal;
		this.args.gravity   = 0.5;

		this.args.punchCharge = 0;

		this.args.width     = 15;
		this.args.height    = 41;

		this.args.normalHeight = 41;
		this.args.rollingHeight = 28;

		this.punchTime = 0;
		this.punched  = 0;

		this.beforePunch = 'standing';

		this.bombsDropped = 0;

		this.sparks = new Set();

		this.args.bindTo('falling', v => {

			if(v || !this.args.flying)
			{
				return;
			}

			if(this.args.mode === 1 || this.args.mode === 2 || this.args.mode === 3)
			{
				this.args.climbing = true;

				this.args.gSpeed = 0;
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
			}
		});
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.box = this.findTag('div');

		this.punchAura = new Tag('<div class = "punch-aura">');

		this.punchAura.style({display: 'none'})

		this.sprite.appendChild(this.punchAura.node);

		this.args.bindTo('animation', v => this.box.setAttribute('data-animation', v));

		this.addEventListener('jump', event => {
			if(this.willPunch)
			{
				// this.args.xSpeed = 0.25 * (this.xAxis
				// 	? (Math.abs(this.punchMomentum) * this.xAxis)
				// 	: this.punchMomentum
				// );

				this.punchTime = Date.now();
				this.punched++;
			}
		});
	}

	update()
	{
		const falling = this.args.falling;

		const wasMoving = this.args.gSpeed;

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
				x: this.args.x
				, y: this.args.y - 16
				, owner: this
				, xSpeed: this.args.direction * 10 + (-1 + (Math.random() * 2))
				, ySpeed: Math.random() * -2
			});

			this.viewport.spawn.add({object: bomb});
		}

		this.readying = false;

		if(!this.args.falling && this.punchTime && Date.now() - this.punchTime > (this.willPunch ? 1536 : 384))
		{
			this.punchMomentum = 0;
			this.punchTime = false;
			this.willPunch = false;
			this.punching  = false;
			this.punched = 0;
		}

		if(this.punchTime && Date.now() - this.punchTime > 256)
		{
			this.readying = true;
		}

		if(this.punchTime && Date.now() - this.punchTime > 128)
		{
			this.punching = true;
		}

		if(this.punching)
		{
			this.args.rolling = false;
		}

		if(this.punched
			&& Math.abs(this.args.gSpeed) > 5
			&& !this.auraVisible
			&& (this.punched >= 3 || Math.abs(this.args.gSpeed) > 15)
		){
			this.auraVisible = true;
			this.viewport.onFrameOut(6, () => {
				this.punchAura.style({display: 'none'})
				this.auraVisible = false;
			});
			this.punchAura.style({display: 'initial'});
		}

		if(this.willPunch)
		{
			if(this.args.punchCharge < 10)
			{
				this.args.punchCharge += 1;
			}

			this.punchMomentum = Math.sign(this.punchMomentum) * Math.max(
				Math.abs(this.punchMomentum)
				, this.args.punchCharge * (0.3 * Math.min(this.punched, 3))
			);
		}
		else if(!this.punched && this.args.punchCharge > 4)
		{
			this.args.punchCharge -= 4;
		}
		else if(!this.punched && this.args.punchCharge > 0)
		{
			this.args.punchCharge = 0;
		}

		this.willStick = false;
		this.stayStuck = false;

		if(!falling)
		{
			this.bombsDropped = 0;
			this.springing = false;

			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(this.args.flying)
			{
				this.args.flying = false;
				this.args.float  = 0;
			}

			this.args.knucklesFlyCoolDown = 15;

			this.args.flying = false;

			if(!this.args.rolling)
			{
				if(this.args.climbing)
				{
					if(this.args.modeTime < 2 || this.yAxis === 0)
					{
						this.args.animation = 'climbing';
						this.args.gSpeed = 0;
					}
					else if(this.yAxis < 0)
					{
						this.args.animation = 'climbing-up';

						if(Math.abs(this.args.gSpeed) < 4)
						{
							this.args.direction = this.args.mode === 1 ? 1 : -1;
							this.args.gSpeed += -this.args.direction;
						}
					}
					else if(this.yAxis > 0)
					{
						this.args.animation = 'climbing-down';

						if(Math.abs(this.args.gSpeed) < 4)
						{
							this.args.direction = this.args.mode === 1 ? 1 : -1;
							this.args.gSpeed += this.args.direction;
						}
					}
				}
				else if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
				{
					this.args.animation = 'skidding';
				}
				else if(this.holdBomb)
				{
					this.args.animation = 'hold-bomb';
				}
				else if(this.throwing)
				{
					this.args.animation = 'throw-bomb';
				}
				else if(this.readying || this.willPunch)
				{
					this.args.animation = 'readying';
				}
				else if(!this.readying && this.punched)
				{
					if(this.punched % 2)
					{
						this.args.animation = 'jabbing';
					}
					else
					{
						this.args.animation = 'punching';
					}
				}
				else if(speed > maxSpeed * 0.75)
				{
					this.args.animation = 'running';
				}
				else if(this.args.moving && this.args.gSpeed)
				{
					this.args.animation = 'walking';
				}
				else
				{
					this.args.animation = 'standing';
				}
			}
			else
			{
				this.args.animation = 'rolling';
			}

			if(this.args.grinding)
			{
				this.args.rolling = false;

				this.args.animation = 'grinding';
			}
		}
		else
		{
			if(this.springing)
			{
				this.args.groundAngle = 0;
			}

			if(this.args.flying)
			{
				this.args.animation = 'flying';
			}
			else if(this.args.jumping)
			{
				// if(!this.willPunch && this.punched && this.args.ySpeed > 0)
				// {
				// 	this.args.animation = 'kick';
				// }
				// else

				if(this.willPunch || this.punching)
				{
					this.args.animation = 'uppercut';

					this.punched++;

					this.punchAura.style({display: 'initial'});
					this.auraVisible = true;

					this.viewport.onFrameOut(15, () => {
						this.punchAura.style({display: 'none'});
						this.auraVisible = false;
					});
				}
				else if(!this.punched)
				{
					this.args.animation = 'jumping';
				}
			}

			if(this.args.climbing && !this.args.jumping)
			{
				this.args.ySpeed = 0;
				this.args.xSpeed = 0;
				this.args.ignore = 10;
				this.args.falling = false;
				this.args.animation = 'walking';
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

		if(this.args.flying)
		{
			if(this.yAxis > 0 || this.bMap('checkBelow', this.x, this.y).get(Platformer))
			{
				this.args.flying = false;
				return;
			}

			if(this.args.ySpeed > 0)
			{
				this.args.ySpeed = 0;
			}

			if(this.args.ySpeed < 1)
			{
				this.args.ySpeed += 1;
			}

			if(this.args.ySpeed > 1)
			{
				this.args.ySpeed -= 1;
			}

			if(this.xAxis)
			{
				this.args.flyDirection = Math.sign(this.xAxis);
			}

			this.args.direction = Math.sign(this.args.xSpeed);

			if(this.args.direction < 0)
			{
				this.args.facing = 'left';
			}
			else
			{
				this.args.facing = 'right';
			}

			if(this.args.flyDirection)
			{
				if(Math.abs(this.args.xSpeed) < 16)
				{
					if(this.args.flyDirection !== Math.sign(this.args.xSpeed))
					{
						this.args.xSpeed += 0.15625 * Math.sign(this.args.flyDirection) * 4;
					}
					else
					{
						this.args.xSpeed += 0.15625 * Math.sign(this.args.flyDirection);
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
		else if(this.args.mode % 2 === 0 || this.args.groundAngle)
		{
			this.args.flyDirection = 0;
		}

		if(this.args.knucklesFlyCoolDown > 0)
		{
			this.args.knucklesFlyCoolDown--;
		}

		super.update();

		if(this.willPunch && !wasMoving)
		{
			this.args.gSpeed = 0;
		}

		if(this.args.mode === 0 || this.args.mode === 2)
		{
			this.args.climbing = false;
		}

		if(this.args.grinding && !this.args.falling && this.args.gSpeed)
		{
			const sparkParticle = new Tag(`<div class = "particle-sparks">`);
			const sparkEnvelope = new Tag(`<div class = "envelope-sparks">`);

			sparkEnvelope.appendChild(sparkParticle.node);

			const sparkPoint = this.rotatePoint(
				-this.args.gSpeed * 1.75 * this.args.direction
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

		if(this.args.grinding)
		{
			this.args.rolling = false;

			this.args.animation = 'grinding';
		}

		if(this.args.hangingFrom)
		{
			this.args.animation = 'hanging';
		}

		if(this.args.falling && this.springing && this.args.ySpeed >= 0)
		{
			this.args.animation = 'dropping';
		}
		else if(this.args.falling && this.springing)
		{
			this.args.animation = 'springdash';
		}

		if(this.args.standingOn && this.args.standingOn.isVehicle)
		{
			this.args.animation = this.args.standingOn.ridingAnimation || 'standing';
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

		if(this.args.dead)
		{
			this.args.animation = 'dead';
		}

		this.box.style({'--punchCharge': this.args.punchCharge})
	}

	startle()
	{
		super.startle();

		this.onNextFrame(() => this.args.animation = 'startle');
	}

	dropBomb()
	{
		if(this.args.falling)
		{
			this.args.ySpeed = -8;
		}

		const bomb = new KnuxBomb({
			x: this.args.x
			, y: this.args.y - 16
			, owner: this
			, xSpeed: this.args.xSpeed
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
		if(this.args.hangingFrom)
		{
			super.command_0();
			return;
		}

		super.command_0();

		if(!this.args.jumping)
		{
			return
		}

		if(this.willPunch || !this.args.falling)
		{
			return;
		}

		this.args.flying = true;
		this.args.xSpeed = 9 * this.args.direction;
		this.args.willJump = false;
	}

	readyStart(inputDirection = 0, button = 1)
	{
		if(this.args.flying || this.args.climbing || this.args.falling)
		{
			return;
		}

		this.readyButton = button;

		if(this.punchTime && Date.now() - this.punchTime < 108)
		{
			this.punchMomentum = 0;
			this.args.ignore = 16;
			this.willPunch = false;
			this.punchTime = false;
			this.punched = 0;
			return;
		}

		this.willPunch = true;

		const direction = Math.sign(this.xAxis || inputDirection || this.args.direction);

		this.args.direction = Math.sign(direction || this.punchMomentum);

		if(direction < 0)
		{
			this.args.facing = 'left';
		}
		else
		{
			this.args.facing = 'right';
		}

		if(this.punchTime)
		{
			this.args.ignore = 15;
			this.args.gSpeed = 0;
			this.punchTime   = false;
			return;
		}

		this.punchMomentum = Math.abs(this.punchMomentum || this.args.gSpeed || 4) * Math.sign(direction || this.xAxis);
		this.args.ignore = 15;
		this.args.gSpeed = 0;
	}

	readyStop(inputDirection, button)
	{
		if(this.readyButton !== button)
		{
			return;
		}

		if(this.args.flying || this.args.climbing || this.args.falling)
		{
			return;
		}

		if(this.punchTime && Date.now() - this.punchTime < 64)
		{
			this.willPunch = false;
			this.punchMomentum = 0;
			this.punched = 0;
			return;
		}

		const direction = Math.sign(this.xAxis || inputDirection || this.args.direction);

		if(!direction || Math.sign(direction) === Math.sign(this.punchMomentum))
		{
			this.args.gSpeed = direction
				? (Math.abs(this.punchMomentum) * direction)
				: this.punchMomentum;
		}
		else if(direction)
		{
			this.punchMomentum = Math.abs(this.punchMomentum) * direction;

			this.args.gSpeed = 1 * (direction
				? (Math.abs(this.punchMomentum) * direction)
				: this.punchMomentum
			);
		}

		// if(this.xAxis && Math.sign(this.xAxis) !== Math.sign(this.punchMomentum))
		// {
		// 	this.punchMomentum *= 0.25;

		// 	this.punchMomentum = Math.abs(this.punchMomentum) * Math.sign(this.xAxis);
		// }

		this.args.direction = Math.sign(direction || this.punchMomentum);

		if(direction < 0)
		{
			this.args.facing = 'left';
		}
		else
		{
			this.args.facing = 'right';
		}

		this.punchTime = Date.now();

		this.willPunch = false;

		if(!this.args.falling && this.args.gSpeed)
		{
			const dustParticle = new Tag(`<div class = "particle-dust">`);

			const dustDist = Math.sign(this.args.gSpeed) * this.dustDist || 0;

			const dustPoint = this.rotatePoint(this.args.gSpeed, 0);

			dustParticle.style({
				'--x': dustPoint[0] + dustDist + this.x
				, '--y': dustPoint[1] + this.y
				, 'z-index': 0
				, opacity: (Math.random() ** 2) * 0.5 + 0.5
			});

			viewport.particles.add(dustParticle);

			viewport.onFrameOut(20, () => {
				viewport.particles.remove(dustParticle);
			});
		}

		if(this.throwing || this.args.climbing)
		{
			return;
		}

		this.punched++;
	}

	command_1()
	{
		this.readyStart(0, 1);
	}

	release_1()
	{
		this.readyStop(0, 1);
	}

	command_4()
	{
		this.readyStart(-1, 4);
	}

	release_4()
	{
		this.readyStop(-1, 4);
	}

	command_5()
	{
		this.readyStart(1, 5);
	}

	release_5()
	{
		this.readyStop(1, 5);
	}

	command_2()
	{
		if(!this.args.ignore && this.args.falling && !this.args.flying && this.bombsDropped < 3)
		{
			this.dropBomb();

			this.bombsDropped++;

			return;
		}

		if(this.args.falling || this.args.climbing)
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
		if(this.args.falling || this.args.climbing)
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
				this.args.animation = 'springdash'
			});
		}
	}

	get solid() { return false; }
	get canRoll() { return !this.args.climbing; }
	get canFly() { return true; }
	get isEffect() { return false; }
	get controllable() { return !this.args.npc; }
}
