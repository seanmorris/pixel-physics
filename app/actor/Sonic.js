import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

import { Twist } from '../effects/Twist';
import { Pinch } from '../effects/Pinch';

import { Png } from '../sprite/Png';

import { Ring } from './Ring';

import { FireSheild }     from '../powerups/FireSheild';
import { BubbleSheild }   from '../powerups/BubbleSheild';
import { ElectricSheild } from '../powerups/ElectricSheild';

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

		this.accelNormal = 0.25;
		this.accelSuper  = 0.70;

		this.args.accel     = 0.25;
		this.args.decel     = 0.40;

		this.gSpeedMaxNormal = 18;
		this.gSpeedMaxSuper  = 25;

		this.jumpForceNormal = 11;
		this.jumpForceSuper  = 16;

		this.args.gSpeedMax = this.gSpeedMaxNormal;
		this.args.jumpForce = this.jumpForceNormal;
		this.args.gravity   = 0.5;

		this.args.width  = 16;
		this.args.height = 40;

		this.args.lookTime = 0;

		this.args.normalHeight  = 40;
		this.args.rollingHeight = 28;

		// this.registerDebug('sonic');

		this.spindashCharge = 0;
		this.dropDashCharge = 0;

		this.willStick = false;
		this.stayStuck = false;

		this.dashed = false;

		this.airControlCard = View.from(require('../cards/sonic-air-controls.html'));
		this.controlCard    = View.from(require('../cards/sonic-controls.html'));

		this.moveCard = View.from(require('../cards/basic-moves.html'));

		this.args.spriteSheet = this.spriteSheet = '/Sonic/sonic.png';

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

	update()
	{
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
			const direction = this.public.direction;
			const gSpeed    = this.public.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.public.gSpeedMax;

			this.args.height = this.public.normalHeight;

			if(this.spindashCharge)
			{
				this.args.animation = 'spindash';
			}
			else if(!this.public.rolling)
			{
				if(Math.sign(this.public.gSpeed) !== direction && this.public.gSpeed)
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

		if(this.public.rolling)
		{
			this.args.animation = 'rolling';
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
			this.args.animation = 'standing';
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

		super.update();
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

		let dashSpeed = direction * 11;

		if(this.public.wallSticking)
		{
			this.args.x += dashSpeed;
			dashSpeed = direction * 18;
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

		// const foreDistance = this.castRay(
		// 	finalSpeed
		// 	, finalSpeed > 0 ? 0 : Math.PI
		// 	, (i, point) => {
		// 		if(this.getMapSolidAt(...point, this.public.layer))
		// 		{
		// 			return i;
		// 		}
		// 	}
		// );

		// if(foreDistance !== false)
		// {
		// 	dashSpeed = foreDistance * Math.sign(dashSpeed);
		// }

		this.args.animation = 'airdash';

		this.args.xSpeed = finalSpeed;
		this.args.ySpeed = 0;

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

	hold_0()
	{
		if(this.yAxis > 0 && this.public.jumping)
		{
			if(this.dropDashCharge < 20)
			{
				this.dropDashCharge++;
			}
		}
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

	command_1()
	{
		if(this.args.wallSticking)
		{
			this.doJump(0);
		}

		if(this.args.gSpeed && !this.args.falling && !this.args.rolling)
		{
			this.args.rolling = true;

			const standOrRecheck = () => {

				const backOfHead =[this.x-this.args.width/2, this.y+this.args.height+1]

				const actualBackOfHead = this.rotatePoint(...backOfHead);

				if(this.getMapSolidAt(...actualBackOfHead))
				{
					this.viewport.onFrameOut(20, standOrRecheck);

					return;
				}

				this.args.rolling = false;

			};

			this.viewport.onFrameOut(20, standOrRecheck);
		}
	}

	release_1() // spindash
	{
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

			const dustPoint = this.rotatePoint(this.args.gSpeed, 0);

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
		}
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

		let dashSpeed = this.distanceFrom(ring) * 8 * ((Math.PI / 2) / angleDiff);

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

		this.args.xSpeed  = dashSpeed * Math.cos(angle);
		this.args.ySpeed  = dashSpeed * Math.sin(angle);
		this.args.gSpeed  = 0;

		this.lightDashTimeout();
	}

	collect(pickup)
	{
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
		if(this.args.wallSticking)
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

		this.args.animation = 'skidding';
	}

	get solid() { return false; }
	get canRoll() { return !this.public.wallSticking; }
	get isEffect() { return false; }
	get controllable() { return true; }


	get facePoint() {

		if(this.public.wallSticking)
		{
			return this.rotatePoint(0,-5);
		}

		return super.facePoint;
	}

}
