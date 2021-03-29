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
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type = 'actor-sonic actor-item';

		this.accelNormal = 0.35;
		this.accelSuper  = 0.70;

		this.args.accel     = 0.35;
		this.args.decel     = 0.4;

		this.gSpeedMaxNormal = 16;
		this.gSpeedMaxSuper  = 28;

		this.jumpForceNormal = 11;
		this.jumpForceSuper  = 16;

		this.args.gSpeedMax = this.gSpeedMaxNormal;
		this.args.jumpForce = this.jumpForceNormal;
		this.args.gravity   = 0.5;

		this.args.width = 28;

		this.args.normalHeight = 40;
		this.args.rollingHeight = 23;

		this.args.height = 40;

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

			if(this.public.mode === 1 || this.public.mode === 3)
			{
				this.args.wallSticking = true;

				this.args.gSpeed = 0;
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
			}
			else
			{
				this.args.wallSticking = false;
				this.willStick = false;
				this.stayStuck = false;
			}
		});
	}

	onAttached(event)
	{
		if(!Sonic.png)
		{
			const png = Sonic.png = new Png(this.public.spriteSheet);

			png.ready.then(()=>{
				const newPng = png.recolor({
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
			this.args.wallSticking = false;
		}
		else
		{
			this.doubleSpin = this.dashed = false;

			if(this.public.mode % 2 === 0)
			{
				this.args.wallSticking = false;
			}

			this.willStick = false;
			this.stayStuck = false;
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

		if(!this.box)
		{
			super.update();
			return;
		}

		if(this.public.wallSticking)
		{
			this.box.setAttribute('data-animation', 'wall-stick');

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
				this.box.setAttribute('data-animation', 'lightdash-back');
			}
			else if(direction > 0)
			{
				this.box.setAttribute('data-animation', 'lightdash');
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
				this.box.setAttribute('data-animation', 'spindash');
			}
			else if(!this.public.rolling)
			{
				if(Math.sign(this.public.gSpeed) !== direction && Math.abs(this.public.gSpeed - direction) > 5)
				{
					this.box.setAttribute('data-animation', 'skidding');

					// const viewport = this.viewport;

					// const dustParticle = new Tag('<div class = "particle-dust">');

					// const dustPoint = this.rotatePoint(this.args.gSpeed, 0);

					// dustParticle.style({
					// 	'--x': dustPoint[0] + this.x
					// 	, '--y': dustPoint[1] + this.y
					// 	, 'z-index': 0
					// 	, opacity: Math.random() * 2
					// });

					// viewport.particles.add(dustParticle);

					// setTimeout(() => {
					// 	viewport.particles.remove(dustParticle);
					// }, 350);
				}
				else if(speed > maxSpeed / 2)
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

			if(!this.spindashCharge && this.dashDust)
			{
				this.dashDust.remove();

				this.dashDust = null;
			}
		}
		else if(!this.dashed)
		{
			this.args.height = this.public.rollingHeight;
			this.box.setAttribute('data-animation', 'jumping');
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

		if(this.pincherBg || this.pincherFg)
		{
			this.pincherBg.args.scale *= 0.875;
			this.pincherFg.args.scale *= 0.875;

			if(Math.abs(this.pincherBg.args.scale) < 0.001)
			{
				this.pincherBg.args.scale = 0;
				this.pincherFg.args.scale = 0;
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
		if(!this.dashed)
		{
			super.readInput();
		}
	}

	command_4()
	{
		if(this.public.falling)
		{
			this.airDash(-1);

			this.args.facing = 'left';
		}
	}

	command_5()
	{
		if(this.public.falling)
		{
			this.airDash(1);
		}
	}

	airDash(direction)
	{
		if(this.dashed || this.public.ignore)
		{
			return;
		}

		const dashSpeed = direction * 12;

		const foreDistance = this.scanForward(dashSpeed, 0.5);

		if(foreDistance === 0)
		{
			this.dashed = true;
			this.box.setAttribute('data-animation', 'airdash');
			return;
		}

		this.box.setAttribute('data-animation', 'airdash');

		if(Math.sign(this.public.xSpeed) !== Math.sign(direction))
		{
			this.args.xSpeed = 0;
		}

		if(this.public.ySpeed > 0)
		{
			this.args.ySpeed = 0;
		}

		this.args.xSpeed += dashSpeed;

		this.dashTimer = 0;

		this.dashed = true;
	}

	command_0()
	{
		this.dropDashCharge = 0;

		if(this.public.falling && !this.dashed && !this.doubleSpin)
		{
			this.doubleSpin = true;
			this.args.xOff  = 0;
			this.args.yOff  = 32;

			this.pinch(-300, 50);
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

			this.willStick = false;
		}
		else if(this.public.jumping || this.dashed)
		{
			this.dropDashCharge = 0;

			this.willStick = true;
			this.stayStuck = true;
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

	release_0()
	{
		super.release_0();

		this.willStick = false;
		this.stayStuck = false;

		if(this.public.wallSticking)
		{
			this.args.falling = true;
			this.args.ySpeed  = 0;
			this.airDash(this.public.mode === 1 ? 1 : -1);
			this.args.ignore  = -2;
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

		this.box.setAttribute('data-animation', 'spindash');

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
		// if(!this.public.falling)
		// {
		// 	return;
		// }

		if(this.lightDashing)
		{
			return;
		}

		if(this.lightDashingCoolDown > 0)
		{
			return;
		}

		const ring = this.findDashableRing(64);

		if(ring)
		{
			this.lightDash(ring);

			// this.lightDashingCoolDown = 9;
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
		return this.findDashableRing();
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

	readInput()
	{
		if(!this.lightDashing)
		{
			super.readInput();
		}
	}

	lightDash(ring)
	{
		let currentAngle;

		this.spindashCharge = 0;

		let angle = Math.atan2(ring.y - this.y, ring.x - this.x);

		if(this.public.falling)
		{
			currentAngle = this.public.airAngle;
		}
		// else
		// {
		// 	currentAngle = this.public.groundAngle;

		// 	switch(this.public.mode)
		// 	{
		// 		case MODE_FLOOR:
		// 			currentAngle = currentAngle;
		// 			break;

		// 		case MODE_LEFT:
		// 			currentAngle = -(currentAngle - (Math.PI / 2));
		// 			break;

		// 		case MODE_CEILING:
		// 			currentAngle = -(currentAngle - (Math.PI));
		// 			break;

		// 		case MODE_RIGHT:
		// 			currentAngle = (currentAngle + (Math.PI / 2));
		// 			break;
		// 	}

		// 	if(this.public.direction < 0)
		// 	{
		// 		currentAngle += Math.PI;
		// 	}

		// 	if(currentAngle > Math.PI)
		// 	{
		// 		currentAngle -= Math.PI * 2;
		// 	}
		// }

		const angleDiff = Math.abs(currentAngle - angle);

		if(!this.lightDashing)
		{
			if(angleDiff >= (Math.PI / 2))
			{
				return;
			}
		}

		let dashSpeed = this.distanceFrom(ring) * ((Math.PI / 2) / angleDiff);

		const maxDash = 55;

		if(dashSpeed > maxDash)
		{
			dashSpeed = maxDash;
		}

		const space = this.scanForward(dashSpeed, 0.5, false);

		if(space && dashSpeed > space)
		{
			dashSpeed = space / 2;
		}

		this.args.ignore = 4;

		this.args.float = -1;

		const direction = Math.sign(this.args.xSpeed) || Math.sign(this.args.gSpeed);

		if(this.public.direction < 0)
		{
			this.box.setAttribute('data-animation', 'lightdash-back');
		}
		else if(this.public.direction > 0)
		{
			this.box.setAttribute('data-animation', 'lightdash');
		}

		const breakGroundAngle = (Math.PI / 8) * 2;

		this.args.airAngle  = angle;

		this.lightDashing = true;

		if(this.public.falling || angleDiff > breakGroundAngle)
		{
			this.args.gSpeed = 0;
			this.args.xSpeed = Math.round(dashSpeed * Math.cos(angle));
			this.args.ySpeed = Math.round(dashSpeed * Math.sin(angle));
		}
		// else
		// {
		// 	this.args.gSpeed = Math.round(dashSpeed * (Math.sign(this.public.gSpeed) || this.public.direction));
		// 	this.args.rolling = false;
		// }

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

	get solid() { return false; }
	get canRoll() { return true; }
	get isEffect() { return false; }
	get controllable() { return true; }

}
