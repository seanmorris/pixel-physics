import { PointActor } from './PointActor';
import { Platformer } from '../behavior/Platformer';
import { Tag } from 'curvature/base/Tag';

import { KnuxBomb } from './KnuxBomb';
import { Spindash } from '../behavior/Spindash';

import { Spring } from './Spring';
import { SkidDust } from '../behavior/SkidDust';
import { Crouch }   from '../behavior/Crouch';
import { LookUp }   from '../behavior/LookUp';
import { TechnoSqueak } from './TechnoSqueak';

export class Knuckles extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.canonical = 'Knuckles';

		window.knuckles = this;

		this.behaviors.add(new SkidDust);
		this.behaviors.add(new Spindash);
		this.behaviors.add(new Crouch);
		this.behaviors.add(new LookUp);

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

		this.args.normalGravity = 0.5;
		this.args.slowGravity   = 0.125;

		this.args.punchMomentum = 0;

		this.args.width     = 15;
		this.args.height    = 41;

		this.args.normalHeight = 41;
		this.args.rollingHeight = 28;

		this.punchTime = 0;
		this.punched  = 0;

		this.beforePunch = 'standing';

		this.bombsDropped = 0;
		this.args.bellySliding = false;
		this.slideTime = 0;

		this.sparks = new Set();

		this.flyTime = 0;

		this.args.bindTo('punchMomentum', v => this.args.punchSpeed = Math.abs(v * 0.5));

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
		if(this.box)
		{
			return;
		}

		super.onRendered(event);

		this.autoStyle.get(this.box)['--punchSpeed'] = 'punchSpeed';

		this.punchAura = new Tag('<div class = "punch-aura">');
		this.punchAura.style({display: 'none'})

		this.sprite.appendChild(this.punchAura.node);

		this.args.bindTo('animation', v => this.box.setAttribute('data-animation', v));

		this.addEventListener('jump', event => {
			if(this.willPunch)
			{
				this.punchTime = this.viewport.args.frameId;
				this.punched++;
			}
		});
	}

	update()
	{
		if(this.args.bellySliding)
		{
			this.xAxis = 0;
		}

		if(this.args.flying)
		{
			const frontUpSolid = this.getMapSolidAt(this.args.x + this.args.xSpeed, this.args.y + -18);
			const frontSolid   = this.getMapSolidAt(this.args.x + this.args.xSpeed, this.args.y);
			const downSolid    = this.getMapSolidAt(this.args.x, this.args.y + 1);

			if(frontSolid && !frontUpSolid && !downSolid)
			while(this.getMapSolidAt(this.args.x + this.args.xSpeed, this.args.y))
			{
				this.args.y--;
			}

			this.args.gravity = this.args.slowGravity;
			this.flyTime++;
		}
		else
		{
			this.args.didBoost = false;
			this.args.gravity  = this.args.normalGravity;
			this.flyTime = 0;
		}

		if(this.args.dead)
		{
			this.punching = false;
		}

		if(this.groundTime === 1 && this.punching)
		{
			this.punching = false;
			this.readyStart(0,1);
		}

		const falling = this.args.falling;

		const wasMoving = this.args.gSpeed;

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!this.args.falling && this.readyTime && this.viewport.args.frameId - this.readyTime > 36)
		{
			this.punched   = false;
			this.readying  = false;
			this.willPunch = false;
			this.punchTime = false;
			this.readyTime = false;
			this.punching = false;

			if(Math.sign(this.args.punchMomentum) === Math.sign(this.xAxis))
			{
				this.args.gSpeed = this.args.punchMomentum;
			}

			this.args.punchMomentum = 0;
		}
		else if(this.readyTime && this.xAxis && Math.abs(this.args.punchMomentum) < 20)
		{
			this.args.punchMomentum += this.xAxis * 0.05;
		}

		if(this.throwing && this.viewport.args.frameId - this.throwing > 20)
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

		if(this.punchTime && this.viewport.args.frameId - this.punchTime > 15)
		{
			this.readying = true;
		}

		if(this.punchTime && this.viewport.args.frameId - this.punchTime > 10)
		{
			this.punching = true;
		}

		if(this.punching)
		{
			this.args.rolling = false;
		}

		if(this.punching && Math.abs(this.args.gSpeed) > 10)
		{
			this.auraVisible = true;
			this.viewport.onFrameOut(6, () => {
				this.punchAura.style({display: 'none'})
				this.auraVisible = false;
			});

			this.punchAura.style({display: 'initial'});
		}
		else
		{
			this.auraVisible = false;
			this.punchAura.style({display: 'none'})
		}

		this.willStick = false;
		this.stayStuck = false;

		if(this.args.mercy)
		{
			this.args.flying = false;
		}

		if(!falling)
		{
			this.bombsDropped = 0;
			this.springing = false;

			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			this.args.knucklesFlyCoolDown = 15;

			this.args.flying = false;

			if(this.args.bellySliding)
			{
				this.args.animation = 'flying';
			}
			else if(!this.args.rolling)
			{
				if(this.args.climbing)
				{
					const climbDir = this.args.mode === 3 ? -1:1;

					if(!this.getMapSolidAt(this.args.x + -climbDir, this.args.y+1))
					{
						this.args.direction = -climbDir;
						this.args.climbing = false;
						this.args.facing = climbDir > 0 ? 'left' : 'rigjt';
						this.args.animation = 'dropping';
						this.args.x += this.args.width * 0.5 * climbDir;
						this.args.groundAngle = 0;
						this.args.falling = true;
						this.args.ySpeed = this.gSpeedLast * (this.args.mode === 3 ? -1:1);
						this.args.gSpeed = 0;
						this.args.mode = 0;
						return;
					}

					const ledgeDir = this.args.mode === 1 ? -1 : 1;
					const ledgeDist = 16;

					if(this.args.modeTime < 2 || this.yAxis === 0)
					{
						if(!this.climbOverCancel)
						{
							this.args.animation = 'climbing';
							this.args.gSpeed = 0;
						}
					}
					else if(this.yAxis < -0.55)
					{
						if(!this.getMapSolidAt(this.args.x + 18 * ledgeDir, this.args.y - ledgeDist))
						{
							this.args.animation = 'climbing-over';

							if(!this.climbOverCancel)
							{
								this.args.ignore = 12;
								this.args.gSpeed = 0;

								this.climbOverCancel = this.viewport.onFrameOut(12, () =>{
									if(this.args.falling)
									{
										this.climbOverCancel = false;
										return;
									}
									this.args.x += this.args.width * 0.5 * ledgeDir;
									this.args.y -= ledgeDist;
									this.args.direction = ledgeDir;
									this.args.facing = ledgeDir > 0 ? 'right' : 'left';
									this.args.climbing = false;
									this.climbOverCancel = false;
								});
							}
						}
						else
						{
							this.args.animation = 'climbing-up';

							if(Math.abs(this.args.gSpeed) < 4)
							{
								const dir = [0,1,0,-1][this.args.mode];
								this.args.direction = dir;
								this.args.gSpeed += -dir;
							}
						}
					}
					else if(this.yAxis > 0.55)
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
			this.args.climbing = false;

			if(this.springing)
			{
				this.args.groundAngle = 0;
			}

			if(this.args.flying)
			{
				let inWater = false, topWater = false;

				const topRegions = this.viewport.regionsAtPoint(this.args.x, this.args.y - 36)

				for(const region of this.regions)
				{
					if(region.isWater)
					{
						inWater = true;
					}
				}

				if(Math.abs(this.args.xSpeed) > 6 || Math.abs(this.xAxis) < 0.55 || Math.sign(this.xAxis) === Math.sign(this.args.xSpeed))
				{
					if(inWater)
					{
						this.args.animation = 'swimming';
					}
					else
					{
						this.args.animation = 'flying';
					}
				}
				else if(Math.sign(this.xAxis) !== Math.sign(this.args.xSpeed))
				{
					if(Math.abs(this.args.xSpeed) > 3)
					{
						this.args.animation = 'flying-turning';
					}
					else
					{
						this.args.animation = 'flying-stalled';
					}
				}

				if(this.bMap('checkBelow', this.x, this.y).get(Platformer))
				{
					this.args.flying  = false;
					this.args.bellySliding = true;
					this.args.float = 1;
				}

				if(this.yAxis > 0.55)
				{
					this.args.flying = false;
					this.args.ySpeed = 8;
					return;
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

				const maxFlySpeed = (16 + 8 * Math.abs(this.xAxis)) * (inWater ? 0.5 : 1);

				if(this.args.flyDirection)
				{
					if(Math.abs(this.args.xSpeed) < maxFlySpeed)
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

				if(!this.args.didBoost && Math.abs(this.args.xSpeed) > maxFlySpeed)
				{
					this.args.xSpeed -= 0.1 * (this.args.xSpeed - (maxFlySpeed * Math.sign(this.args.xSpeed)));
				}

				if(this.args.ySpeed > 2 && Math.abs(this.args.xSpeed) < 4)
				{
					this.args.xSpeed += 0.1 * Math.sign(this.args.xSpeed);
				}

				if(inWater && this.args.ySpeed > 1)
				{
					this.args.ySpeed = 1;
				}
				if(!inWater && this.args.ySpeed > 0.5)
				{
					this.args.ySpeed = 0.5;
				}

				this.willStick = true;
				this.stayStuck = true;

				this.args.groundAngle = 0;
			}
			else if(this.args.jumping)
			{
				// if(!this.willPunch && this.punched && this.args.ySpeed > 0)
				// {
				// 	this.args.animation = 'kick';
				// }
				// else

				if((Math.abs(this.args.punchMomentum) > 8 || this.readyTime) && (this.willPunch || this.punching))
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
				else
				{
					this.punched = false;
					this.punching = false;
					if(!this.args.bellySliding)
					{
						this.args.animation = 'jumping';
					}
				}
			}
		}

		if(this.args.flying)
		{

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
	}

	updateEnd()
	{
		if(!this.args.falling && this.punchTime && this.viewport.args.frameId - this.punchTime > (this.willPunch ? 90 : 30))
		{
			this.args.punchMomentum = 0;
			this.punchTime = false;
			this.willPunch = false;
			this.punching  = false;
			this.punched = 0;
		}

		if(!this.args.falling)
		{
			if(this.args.bellySliding)
			{
				this.args.rolling   = false;
				this.args.animation = 'sliding';
				this.alwaysSkidding = true;
				this.slideTime++;
			}
			else
			{
				this.alwaysSkidding = false;
				this.slideTime = 0;
			}

			if(Math.abs(this.args.gSpeed) < 1)
			{
				this.args.bellySliding = false;
			}
		}

		super.updateEnd();
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
		if(this.args.flying)
		{
			this.args.flying = false;
			this.args.ySpeed *= 0.25;
		}

		super.release_0();
	}

	command_0()
	{
		this.args.bellySliding = false;

		if(this.args.falling && Math.abs(this.yAxis) > 0.55)
		{
			return;
		}

		super.command_0();

		if(this.yAxis > 0.55)
		{
			return;
		}

		if(this.args.hangingFrom || !this.args.jumping || this.willPunch || !this.args.falling)
		{
			return;
		}

		if(this.args.falling)
		{
			this.args.punchMomentum = 0;
			this.punching = false;
		}

		if(!this.args.jumpArced)
		{
			if(this.getMapSolidAt(this.args.x + Math.sign(this.args.direction) * this.args.width * 0.5, this.args.height * 0.5))
			{
				this.args.xSpeed = Math.sign(this.args.direction) * this.args.width * 0.5;
				this.willStick = true;
				this.climbing = true;
				return
			}
		}

		this.args.direction = Math.sign(this.args.xSpeed) || (this.args.facing === 'left' ? -1:1);
		this.args.willJump  = false;
		this.args.flying    = true;
		this.args.xSpeed    = Math.max(4, Math.abs(this.args.xSpeed)) * this.args.direction;
		this.args.ySpeed    = Math.max(0, this.args.ySpeed);
	}

	readyStart(inputDirection = 0, button = 1)
	{
		if(this.readyTime && this.viewport.args.frameId - this.readyTime > 20)
		{
			return;
		}

		this.readyTime = this.viewport.args.frameId;

		if(this.args.flying || this.args.climbing || this.args.falling)
		{
			return;
		}

		this.readyButton = button;

		if(this.punchTime && this.viewport.args.frameId - this.punchTime < 9)
		{
			this.args.punchMomentum = 0;
			// this.args.ignore = 16;
			this.willPunch = false;
			this.punchTime = false;
			this.punched = 0;
			return;
		}

		this.willPunch = true;

		const direction = Math.sign(this.xAxis || inputDirection || this.args.direction);

		this.args.direction = Math.sign(direction || this.args.punchMomentum);

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
			this.args.gSpeed = 0;
			this.punchTime   = false;
			return;
		}

		this.args.punchMomentum = Math.abs(this.args.punchMomentum || this.args.gSpeed || 4) * Math.sign(direction || this.xAxis);
		this.args.gSpeed = 0;
	}

	damage(other,type)
	{
		if(this.readyTime)
		{
			return false;
		}

		super.damage(other,type);
	}

	readyStop(inputDirection, button)
	{
		this.readyTime = false;

		if(this.readyButton !== button)
		{
			return;
		}

		this.readyButton = false;

		if(this.args.flying || this.args.climbing || this.args.falling)
		{
			return;
		}

		if(this.punchTime && this.viewport.args.frameId - this.punchTime < 64)
		{
			this.willPunch = false;
			// this.args.punchMomentum = 0;
			this.punched = 0;
			return;
		}

		this.args.direction = this.args.facing === 'left' ? -1:1;

		const direction = this.args.direction;

		if(!direction || Math.sign(direction) === Math.sign(this.args.punchMomentum))
		{
			this.args.gSpeed = direction
				? (Math.abs(this.args.punchMomentum) * direction)
				: this.args.punchMomentum;
		}
		else if(direction)
		{
			this.args.punchMomentum = Math.abs(this.args.punchMomentum) * direction;

			this.args.gSpeed = 1 * (direction
				? (Math.abs(this.args.punchMomentum) * direction)
				: this.args.punchMomentum
			);
		}

		this.args.direction = Math.sign(direction || this.args.punchMomentum);

		if(direction < 0)
		{
			this.args.facing = 'left';
		}
		else
		{
			this.args.facing = 'right';
		}

		this.punchTime = this.viewport.args.frameId;

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
		if(this.args.falling)
		{
			this.readyStart(0, 1);
			return;
		}

		if(this.cancelReady)
		{
			this.cancelReady();
			this.cancelReady = false;
		}

		this.args.direction = this.args.facing === 'left' ? -1:1;

		this.args.punchMomentum = this.args.punchMomentum || this.args.gSpeed || 3 * (this.args.direction || 1);

		if(!this.args.gSpeed || !this.punched)
		{
			this.readyButton = 1;
			this.punching = true;
			this.readyStop(Math.sign(this.args.punchMomentum), 1);
			this.cancelReady = this.viewport.onFrameOut(20, () => this.readyStart(this.args.direction, 1));
			return;
		}

		if(this.args.gSpeed > 10)
		{
			this.punchAura.style({display: 'initial'});
			this.auraVisible = true;
		}

		this.punched = this.punched || 1;
		this.args.gSpeed = 0;

		this.readyStart(0, 1);
	}

	release_1()
	{
		if(this.args.falling)
		{
			return;
		}

		if(this.willPunch)
		{
			this.readyStop(0,1);
			return;
		}

		if(this.punchTime && this.viewport.args.frameId - this.punchTime < 220)
		{
			return;
		}

		if(this.punchTime && this.viewport.args.frameId - this.punchTime > 320)
		{
			return;
		}

		if(this.args.gSpeed)
		{
			return;
		}

		// this.args.gSpeed = 0;

		if(!this.cancelReady)
		{
			this.cancelReady = this.viewport.onFrameOut(40, () => this.readyStart(this.args.direction, 1));
		}

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
		// if(!this.args.ignore && this.args.falling && !this.args.flying && this.bombsDropped < 3)
		// {
		// 	this.dropBomb();

		// 	this.bombsDropped++;

		// 	return;
		// }

		// if(this.args.falling || this.args.climbing)
		// {
		// 	return;
		// }

		// if(Math.abs(this.args.gSpeed) > 3)
		// {
		// 	return;
		// }

		// if(this.punchTime || this.throwing)
		// {
		// 	return;
		// }

		// this.holdBomb = this.viewport.args.frameId;
		// this.args.ignore = -1;
		// this.args.gSpeed = 0;
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

		this.throwing = this.viewport.args.frameId;
	}

	setCameraMode()
	{
		if(this.args.climbing)
		{
			this.args.cameraMode = 'climbing';
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
