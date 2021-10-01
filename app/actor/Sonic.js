import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

import { Twist } from '../effects/Twist';
import { Pinch } from '../effects/Pinch';

import { Png } from '../sprite/Png';

import { Ring } from './Ring';
import { Spring } from './Spring';

import { FireSheild }     from '../powerups/FireSheild';
import { BubbleSheild }   from '../powerups/BubbleSheild';
import { ElectricSheild } from '../powerups/ElectricSheild';

import { GrindingRegion } from '../region/GrindingRegion';

import { SkidDust } from '../behavior/SkidDust';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

export class Sonic extends PointActor
{
	png = new Png('/Sonic/sonic.png');

	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type = 'actor-sonic actor-item';

		this.accelNormal = 0.20;
		this.accelSuper  = 0.40;

		this.args.boltCount = 0;

		this.args.accel     = 0.20;
		this.args.decel     = 0.45;

		this.gSpeedMaxNormal = 18;
		this.gSpeedMaxSuper  = 23;

		this.jumpForceNormal = 11.5;
		this.jumpForceSuper  = 16;

		this.args.gSpeedMax = this.gSpeedMaxNormal;
		this.args.jumpForce = this.jumpForceNormal;
		this.args.gravity   = 0.5;

		this.args.width  = 16;
		this.args.height = 40;

		this.args.lookTime = 0;

		this.args.normalHeight  = 40;
		this.args.rollingHeight = 28;

		this.sparks = new Set();

		this.spindashCharge = 0;
		this.dropDashCharge = 0;

		this.willStick = false;
		this.stayStuck = false;

		this.dashed = false;

		this.airControlCard = View.from(require('../cards/sonic-air-controls.html'));
		this.controlCard    = View.from(require('../cards/sonic-controls.html'));

		this.moveCard = View.from(require('../cards/basic-moves.html'));

		this.args.spriteSheet = this.spriteSheet = '/Sonic/sonic.png';

		this.sampleRingLoss = new Audio('/Sonic/ring-loss.wav');
		this.sampleBoltDash = new Audio('/Sonic/S3K_4E.wav');

		this.args.bindTo('falling', v => {

			if(v)
			{
				return;
			}

			if(this.willStick && (this.public.mode === 1 || this.public.mode === 3))
			{
				this.args.wallSticking = true;
				this.onNextFrame(()=>{
					this.dashed = false;
				});
			}
			else
			{
				this.onNextFrame(()=>{
					this.args.wallSticking = false;
				});
			}
		});
	}

	onAttached(event)
	{
		if(!this.superSpriteSheet)
		{
			this.png.ready.then(()=>{
				const newPng = this.png.recolor({
					'8080e0': 'e0e080',
					'6060c0': 'e0e000',
					'4040a0': 'e0e001',
					'202080': 'a0a000'
				});

				 this.superSpriteSheet = newPng.toUrl();
			});
		}
	}

	updateStart()
	{
		if(this.args.grinding && this.args.falling && this.args.ySpeed > 0)
		{
			this.args.animation = 'airdash';
			this.args.grinding = false;
		}

		super.updateStart();

		if(this.args.dead)
		{
			this.args.animation = 'dead';
			return;
		}
	}

	update()
	{
		if(this.args.dead)
		{
			this.args.animation = 'dead';
			super.update();
			return;
		}

		if(this.isSuper)
		{
			if(this.viewport.args.frameId % 60 === 0)
			{
				if(this.args.rings > 0)
				{
					this.args.rings--;
				}
				else
				{
					this.isSuper = false;
					this.setProfile();
				}
			}
		}

		if(this.public.falling)
		{
			if(this.public.wallSticking && !this.dashed)
			{
				if(this.public.mode === 1)
				{
					this.args.direction = -1;
					this.args.facing = 'left';
				}
				else if(this.public.mode === 3)
				{
					this.args.direction = 1;
					this.args.facing = 'right';
				}

				this.args.animation = 'wall-dropping';
				this.args.wallDropping = true;

				this.args.groundAngle = 0;

				this.args.ignore = -2;
			}

			this.args.wallSticking = false;
		}
		else
		{
			this.doubleSpin = this.dashed = false;

			if(this.public.mode % 2 === 0)
			{
				this.args.wallSticking = false;
			}

			if(!this.args.wallSticking)
			{
				this.willStick = false;
			}
		}

		if(this.lightDashingCoolDown > 0)
		{
			this.lightDashingCoolDown--;
		}

		if(this.dashTimer > 0)
		{
			this.dashTimer--;
		}

		const falling = this.public.falling;

		if(this.public.wallSticking)
		{
			this.args.animation = 'wall-stick';

			let slip = 2;

			if(this.yAxis > 0)
			{
				slip = 6;
			}
			else if(this.yAxis < 0)
			{
				this.stayStuck = true;
				slip = 0;
			}

			if(this.public.mode === 1)
			{
				this.args.facing = 'left';
				this.args.direction = 1;

				if(Math.abs(this.args.gSpeed) < slip)
				{
					this.args.gSpeed += 1;
				}
				else
				{
					this.args.gSpeed = slip;
				}
			}
			else if(this.public.mode === 3)
			{
				this.args.facing = 'right';
				this.args.direction = -1;

				if(Math.abs(this.args.gSpeed) < slip)
				{
					this.args.gSpeed -= 1;
				}
				else
				{
					this.args.gSpeed = -slip;
				}
			}
		}
		else if(this.lightDashing)
		{
			const direction = Math.sign(this.public.xSpeed) || Math.sign(this.public.gSpeed);

			if(direction < 0)
			{
				this.args.animation = 'lightdash-back';
			}
			else if(direction > 0)
			{
				this.args.animation = 'lightdash';
			}

			if(falling)
			{
				this.args.direction = Math.sign(this.public.xSpeed) || this.args.direction;

				this.args.mode = MODE_FLOOR;
			}
		}
		else if(!falling)
		{
			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.public.gSpeedMax;

			this.args.height = this.public.normalHeight;

			if(this.spindashCharge)
			{
				this.args.animation = 'spindash';
			}
			else if(!this.args.rolling)
			{

				if(Math.sign(direction) && Math.sign(gSpeed) && Math.sign(gSpeed) !== Math.sign(direction))
				{
					this.args.animation = 'skidding';
				}
				else if(this.public.moving && speed > maxSpeed * 0.45)
				{
					if(this.isSuper && this.public.moving && speed > maxSpeed * 0.95)
					{
						this.args.animation = 'dash';
					}
					else
					{
						this.args.animation = 'running';
					}
				}
				else if(this.public.moving && this.public.gSpeed)
				{
					this.args.animation = 'walking';
				}
				else
				{
					if(this.yAxis > 0.5)
					{
						this.args.animation = 'crouching';

						this.args.lookTime--;

						if(this.public.lookTime < -45)
						{
							this.args.cameraBias = -0.5;
						}
					}
					else if(this.yAxis < -0.5)
					{
						this.args.animation = 'looking-up';

						this.args.lookTime++;

						if(this.public.lookTime > 45)
						{
							this.args.cameraBias = 0.25;
						}
					}
					else
					{
						this.args.animation = 'standing';
						this.args.cameraBias = 0;
						this.args.lookTime = 0;
					}
				}
			}

			if(!this.spindashCharge && this.dashDust)
			{
				this.dashDust.remove();

				this.dashDust = null;
			}

			if(this.dropDashCharge)
			{
				this.args.animation = 'spindash';
			}
		}
		else if(!this.dashed)
		{
			this.args.height = this.public.rollingHeight;

			if(this.public.jumping)
			{
				this.args.animation = 'jumping';
			}
			else if(!this.public.xSpeed && !this.public.ySpeed)
			{
				// this.box.setAttribute('data-animation', 'airdash');
			}
		}
		else if(falling && !this.args.jumping && this.isSuper && this.args.ySpeed > 0)
		{
			this.args.animation = 'dropping';
		}

		if(this.public.hangingFrom)
		{
			this.args.animation = 'hanging';
		}

		if(this.public.rolling)
		{
			if(this.args.animation !== 'spindash')
			{
				this.args.animation = 'rolling';
			}
			else
			{
				this.viewport.onFrameOut(8, () => this.args.animation = 'rolling');
				this.args.animation = 'spindash';
			}
		}

		if(this.skidding && !this.public.rolling && !this.public.falling && !this.spindashCharge)
		{
			this.args.xOff = 8 * -this.args.direction;
			this.args.yOff = 32;

			let warp = -this.public.gSpeed * 15;

			if(Math.abs(warp) > 120)
			{
				warp = 120 * Math.sign(warp);
			}

			this.twist(warp);
		}
		else if(!this.spindashCharge)
		{
			this.twister && (this.twister.args.scale = 0);
		}

		if(this.public.standingOn && this.public.standingOn.isVehicle)
		{
			this.args.animation = this.public.standingOn.ridingAnimation || 'standing';
		}

		if(this.args.grinding && !this.args.falling)
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

		if(this.pincherBg)
		{
			this.pincherBg.args.scale *= 0.875;
			// this.pincherFg.args.scale *= 0.875;

			if(Math.abs(this.pincherBg.args.scale) < 0.001)
			{
				this.pincherBg.args.scale = 0;
				// this.pincherFg.args.scale = 0;
			}
		}
		else
		{
			this.pinch(0, 0);
		}

		if(!this.twister)
		{
			this.twist(0);
		}

		if(this.args.grinding)
		{
			this.args.rolling = false;

			this.args.animation = 'grinding';
		}

		super.update();

		if(this.args.boltDash)
		{
			this.dimmer = this.dimmer || new Tag('<div class = "particle particle-dimmer">');

			const boltParticle = new Tag('<div class = "particle particle-bolt">');

			const speed = this.args.falling
				? this.args.airSpeed
				: this.args.gSpeed;

			const boltPoint = this.rotatePoint(
				(speed < 0 ? 8 : -8)
				, this.args.falling
					? (this.dashed ? (speed < 0 ? 28 : 32) : 14)
					: 28
			);

			this.dimmer.style({
				'--x': this.x + boltPoint[0]
				, '--y': this.y + boltPoint[1]
			});

			this.args.boltCount++;

			const direction = Math.sign(this.args.gSpeed || this.args.xSpeed);

			boltParticle.attr({'data-direction': direction});

			boltParticle.style({
				'--x': this.x + boltPoint[0]
				, '--y': this.y + boltPoint[1]
				, '--index': this.args.boltCount
				, '--direction': direction
				, '--mod': this.viewport.args.frameId % 4
				, '--wipe': Math.abs(speed)
				, '--angle': this.args.falling
					? this.args.airAngle
					: this.realAngle
				, '--dashCharge': 0
			});


			this.viewport.particles.add(boltParticle);

			if(Math.abs(speed) < 20 && this.args.falling)
			{
				this.args.boltDash = false;
			}

			this.viewport.particles.add(this.dimmer);

			this.viewport.onFrameOut(30, () => {
				this.viewport.particles.remove(boltParticle);
			});
		}

		if([...this.regions].filter(r => r.isWater).length
			&& !this.checkBelow(this.x, this.y+16)
			&& this.args.falling
			&& this.dashed
		){
			if(this.yAxis < 0)
			{
				this.args.xSpeed = this.args.xSpeed* 0.95;
				this.args.ySpeed -= Math.abs(this.args.xSpeed) * 0.05;
			}

			if(this.yAxis > 0)
			{
				this.args.xSpeed += Math.abs(this.args.ySpeed) * 0.05 * Math.sign(this.args.xSpeed);
				this.args.ySpeed = this.args.ySpeed* 0.95;
			}
		}

		if(this.args.grinding && !this.args.falling && this.args.gSpeed)
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

	readInput()
	{
		if(!this.lightDashing)
		{
			super.readInput();
		}
	}

	airDash(direction)
	{
		if(this.dashed || (this.public.ignore && this.public.ignore !== -2))
		{
			return;
		}

		let dashSpeed = direction * 13;

		if(this.public.wallSticking)
		{
			this.args.x += dashSpeed;
			dashSpeed = direction * 21;
		}

		this.args.mode = 0;
		this.args.float = 2;

		this.args.rolling = false;
		this.args.height = this.public.normalHeight;

		if(this.public.xSpeed && Math.sign(this.public.xSpeed) !== Math.sign(direction))
		{
			dashSpeed = direction * 18;
			this.args.float  = 6;
			this.args.xSpeed = 0;
		}

		this.args.falling = true;

		const finalSpeed = this.args.xSpeed + dashSpeed;

		const space = this.scanForward(dashSpeed * direction, 0.5);

		if(space && Math.abs(finalSpeed) > Math.abs(space))
		{
			dashSpeed = space * Math.sign(finalSpeed);
		}

		this.args.animation = 'rolling';

		this.viewport.onFrameOut(3, () => this.args.animation = 'airdash');

		this.args.xSpeed = finalSpeed;
		this.args.ySpeed = 0;
		this.args.gSpeed = 0;

		this.dashTimer = 0;

		this.dashed = true;

		this.args.mode = 0;
		this.args.groundAngle = 0;
	}

	command_0()
	{
		this.dropDashCharge = 0;

		if(this.public.jumping && !this.dashed && !this.doubleSpin)
		{
			this.doubleSpin = true;
			this.args.xOff  = 0;
			this.args.yOff  = 32;

			this.pinch(-400, 50);
		}

		super.command_0();
	}

	command_4()
	{
		if(this.public.falling)
		{
			this.airDash(-1);

			this.willStick = 2;
			this.stayStuck = true;
		}
	}

	hold_4(button)
	{
		if(this.public.jumping || this.dashed)
		{
			this.dropDashCharge = 0;

			this.willStick = 2;
			this.stayStuck = true;
		}

		if(this.args.mode === 2)
		{
			this.stayStuck = false;
			this.args.falling = true;
		}
	}

	release_4()
	{
		this.onNextFrame(() => {
			this.willStick = false;
			this.stayStuck = false;
		});

		if(this.public.wallSticking && !this.dashed)
		{
			this.args.falling = true;
			this.args.ySpeed  = 0;

			const mode = this.public.mode;

			this.airDash(mode === 1 ? 1 : -1);

			this.args.facing = mode === 1 ? 'left' : 'right';

			this.args.mode = 0;

			this.dashed = true;
		}
	}

	command_5()
	{
		if(this.public.falling)
		{
			this.airDash(1);

			this.willStick = 2;
			this.stayStuck = true;
		}
	}

	hold_5(button)
	{
		if(this.public.jumping || this.dashed && this.args.mode !== 2)
		{
			this.dropDashCharge = 0;

			this.willStick = 2;
			this.stayStuck = true;
		}

		if(this.args.mode === 2)
		{
			this.stayStuck = false;
			this.args.falling = true;
		}
	}

	release_5()
	{
		this.onNextFrame(() => {
			this.willStick = false;
			this.stayStuck = false;
		});

		if(this.public.wallSticking && !this.dashed)
		{
			this.args.falling = true;
			this.args.ySpeed  = 0;

			const mode = this.public.mode;

			this.airDash(mode === 1 ? 1 : -1);

			this.args.facing = mode === 1 ? 'left' : 'right';

			this.args.mode = 0;

			this.dashed = true;
		}
	}

	command_1()
	{
		if(this.args.ignore)
		{
			return;
		}

		if(this.args.wallSticking)
		{
			this.doJump(0);
		}

		if(this.args.gSpeed && !this.args.falling && !this.args.rolling)
		{
			this.args.rolling = true;

			const standOrRecheck = () => {

				const backOfHead =[this.args.width/2, this.args.height+4]

				// const actualBackOfHead = this.rotatePoint(...backOfHead);

				const solid = this.getMapSolidAt(this.x - backOfHead[0], this.y - backOfHead[1]);

				if(solid)
				{
					this.viewport.onFrameOut(40, standOrRecheck);

					this.args.gSpeed = this.args.direction * 4;
					this.args.rolling = true;

					return;
				}

				this.args.rolling = false;

			};

			this.viewport.onFrameOut(20, standOrRecheck);
		}
	}

	release_1() // spindash
	{
		this.dropDashCharge = 0;

		if(!this.spindashCharge)
		{
			return;
		}

		const direction = this.public.direction;
		let   dashPower = this.spindashCharge / 40;

		if(dashPower > 1)
		{
			dashPower = 1;
		}

		this.args.rolling = true;

		const dashBoost = dashPower * 32;

		if(Math.sign(direction) !== Math.sign(dashBoost))
		{
			this.args.gSpeed = dashBoost * Math.sign(direction);
		}
		else
		{
			this.args.gSpeed += dashBoost * Math.sign(direction);
		}

		this.spindashCharge = 0;

		if(this.dashDust)
		{
			this.dashDust.remove();
		}
	}

	hold_1(button) // spindash
	{
		if(this.args.ignore)
		{
			return;
		}

		if(this.public.jumping)
		{
			if(this.dropDashCharge < 20)
			{
				this.dropDashCharge++;

				return;
			}
		}

		if(this.dropDashCharge)
		{
			return;
		}

		if(this.args.falling || this.willJump || this.public.gSpeed)
		{
			this.spindashCharge = 0;
			return;
		}

		this.args.ignore = 1;

		let dashCharge = this.spindashCharge / 20;

		if(dashCharge > 1)
		{
			dashCharge = 1;
		}

		if(this.spindashCharge === 0)
		{
			this.spindashCharge = 1;

			const viewport = this.viewport;

			const dustParticle = new Tag('<div class = "particle-spindash-dust">');

			const dustPoint = this.rotatePoint(0, 0);

			dustParticle.style({
				'--x': dustPoint[0] + this.x
				, '--y': dustPoint[1] + this.y
				, '--direction': this.public.direction
				, '--dashCharge': 0
			});

			if(this.public.direction < 0)
			{
				dustParticle.setAttribute('data-facing', 'left');
			}
			else if(this.public.direction > 0)
			{
				dustParticle.setAttribute('data-facing', 'right');
			}

			viewport.particles.add(dustParticle.node);

			this.dashDust = dustParticle;
		}
		else if(this.dashDust)
		{
			this.dashDust.style({'--dashCharge': dashCharge});
		}

		if(this.viewport.args.frameId % 3 === 0)
		{
			this.spindashCharge++;
		}

		this.args.xOff = 5 * -this.args.direction;
		this.args.yOff = 32;

		this.twist(120 * dashCharge * this.public.direction);

		this.args.animation = 'spindash';

		if(this.public.direction < 0)
		{
			this.args.facing = 'left';
		}
		else if(this.public.direction > 0)
		{
			this.args.facing = 'right';
		}
	}

	hold_2()
	{
		if(!this.public.falling)
		{
			return;
		}

		if(this.lightDashing)
		{
			return;
		}

		if(this.lightDashingCoolDown > 0)
		{
			return;
		}

		const ring = this.findDashableRing(48);

		if(ring)
		{
			this.lightDash(ring);

			this.lightDashingCoolDown = 9;

			return;
		}
	}

	command_2()
	{
		this.onNextFrame(() => {

			const speed = this.args.falling
				? this.args.airSpeed
				: this.args.gSpeed;

			if(this.isSuper
				&& !this.lightDashing
				&& !this.args.boltDash
				&& Math.abs(speed) > 6
			){
				const xSpeed = this.args.xSpeed;
				const ySpeed = this.args.ySpeed;
				const gSpeed = this.args.gSpeed;

				if(!this.args.falling)
				{
					this.args.gSpeed *= 3;
					this.args.gSpeed = Math.max(-128, Math.min(this.args.gSpeed, 128));

				}
				else
				{
					this.args.xSpeed = Math.max(-64, Math.min(this.args.xSpeed, 64));
					this.args.ySpeed = Math.max(-64, Math.min(this.args.ySpeed, 64));

					this.args.float = 5;

					this.args.xSpeed *= 5;
					this.args.ySpeed *= 5;
				}

				this.args.boltCount = 0;
				this.args.boltDash  = true;

				if(this.viewport.args.audio)
				{
					this.sampleBoltDash.currentTime = 0;
					this.sampleBoltDash.play();
				}

				this.args.opacity = 0;

				this.viewport.onFrameOut(35, () => {
					this.args.opacity = 1;

					this.args.boltDash = false;

					this.args.xSpeed = this.args.xSpeed ? xSpeed : 0;
					this.args.ySpeed = this.args.ySpeed ? ySpeed : 0;
					this.args.gSpeed = this.args.gSpeed ? gSpeed : 0;

					this.dimmer && this.viewport.particles.remove(this.dimmer);

					this.dimmer = false;
				});
			}
		});
	}

	release_2()
	{
		if(!this.args.boltDash)
		{
			return;
		}

		this.args.opacity = 1;

		this.args.boltDash = false;

		this.args.xSpeed /= 2;
		this.args.ySpeed /= 2;
		this.args.gSpeed /= 3;

		this.dimmer && this.viewport.particles.remove(this.dimmer);

		this.dimmer = false;
	}

	command_3()
	{
		this.isSuper = !this.isSuper;

		this.onTimeout(150, () =>{
			if(this.args.rings === 0)
			{
				this.isSuper = false;
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

	findNearestRing()
	{
		return this.findDashableRing(64);
	}

	findDashableRing(maxDist = 128)
	{
		const findRing = actor => {

			if(!(actor instanceof Ring))
			{
				return false;
			}

			const direction = Math.sign(this.public.xSpeed);

			if(direction > 0 && actor.x < this.x)
			{
				return false;
			}

			if(direction < 0 && actor.x > this.x)
			{
				return false;
			}

			return true;
		};

		const ring = this.findNearestActor(findRing, maxDist);

		if(!ring)
		{
			return;
		}

		const nextRing = ring.findNearestActor(findRing, maxDist);

		if(!nextRing)
		{
			return;
		}

		const firstAngle  = Math.atan2(this.y - ring.y, this.x - ring.x);
		const secondAngle = Math.atan2(ring.y - nextRing.y, ring.x - nextRing.x);

		if(Math.abs(firstAngle - secondAngle) > Math.PI / 2)
		{
			return;
		}

		return ring;
	}

	lightDash(ring)
	{
		if(!this.public.falling)
		{
			this.lightDashing = false;
			return false;
		}

		let currentAngle;

		this.spindashCharge = 0;

		let angle = Math.atan2(ring.y - this.y, ring.x - this.x);

		currentAngle = this.args.groundAngle;

		const angleDiff = Math.abs(currentAngle - angle);

		let dashSpeed = this.distanceFrom(ring) * 4 * ((Math.PI / 2) / angleDiff);

		const maxDash = 55;

		if(dashSpeed > maxDash)
		{
			dashSpeed = maxDash;
		}

		const space = this.scanForward(dashSpeed, 0.5);

		if(space && dashSpeed > space)
		{
			dashSpeed = space;
		}

		const direction = Math.sign(this.args.xSpeed) || Math.sign(this.args.gSpeed);

		if(this.public.direction < 0)
		{
			this.args.animation = 'lightdash-back';
		}
		else if(this.public.direction > 0)
		{
			this.args.animation = 'lightdash';
		}

		const breakGroundAngle = Math.PI / 4;

		this.args.airAngle  = angle;

		this.lightDashing = true;

		this.args.xSpeed  = dashSpeed * Math.cos(angle) * 0.5;
		this.args.ySpeed  = dashSpeed * Math.sin(angle) * 0.5;

		this.lightDashTimeout();
	}

	collect(pickup)
	{
		super.collect(pickup);

		if(pickup instanceof Ring)
		{
			if(this.lightDashing)
			{
				const ring = this.findNearestActor(actor => actor instanceof Ring, 128);

				if(ring)
				{
					// this.args.x = pickup.x;
					// this.args.y = pickup.y;

					this.lightDash(ring);
				}
				else
				{
					this.lightDashing = false;
					this.args.float   = 0;
				}
			}
		}
	}

	lightDashTimeout()
	{
		if(this.clearLightDash)
		{
			this.clearTimeout(this.clearLightDash);

			this.clearLightDash = false;
		}

		this.clearLightDash = this.onTimeout(150, () => {
			this.clearLightDash = false;
			this.lightDashing   = false;
			this.args.float     = 0;
		});
	}

	setCameraMode()
	{
		if(this.args.boltDash)
		{
			this.args.cameraMode = 'draggable'
		}
		else if(this.args.wallSticking)
		{
			this.args.cameraMode = 'aerial';
		}
		else
		{
			super.setCameraMode();
		}
	}

	startle()
	{
		super.startle();

		this.onNextFrame(() => this.args.animation = 'skidding');
	}

	die()
	{
		super.die();

		this.onNextFrame(() => this.args.animation = 'dead');
	}

	loseRings()
	{
		super.loseRings();

		if(this.viewport.args.audio && this.sampleRingLoss)
		{
			this.sampleRingLoss.volume = 0.15 + (Math.random() * -0.05);
			this.sampleRingLoss.play();
		}
	}

	collideA(other)
	{
		if(other instanceof Spring)
		{
			this.onNextFrame(()=>this.args.animation = 'springdash');
		}
	}

	get solid() { return false; }
	get canRoll() { return !this.public.wallSticking; }
	get isEffect() { return false; }
	get controllable() { return !this.args.npc; }


	get facePoint() {

		if(this.public.wallSticking)
		{
			return this.rotatePoint(0,-5);
		}

		return super.facePoint;
	}

	crossRegionBoundary(region, entered)
	{
		if(region instanceof GrindingRegion)
		{
			if(!entered)
			{
				if(this.args.falling)
				{
					this.args.animation = 'springdash';
				}
				else
				{
					this.args.grinding = false;
				}
			}
		}

		super.crossRegionBoundary(region, entered);
	}
}
