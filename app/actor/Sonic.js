import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { Twist } from '../effects/Twist';
import { Pinch } from '../effects/Pinch';

import { Png } from '../sprite/Png';

import { Ring } from './Ring';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

export class Sonic extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type      = 'actor-item actor-sonic';

		this.args.accel     = 0.35;
		this.args.decel     = 0.7;

		this.args.skidTraction = 1.75;

		this.args.gSpeedMax = 30;
		this.args.jumpForce = 18;
		this.args.gravity   = 1;

		this.args.width  = 32;
		this.args.height = 40;

		this.spindashCharge = 0;

		this.willStick = false;
		this.stayStuck = false;

		if(!Sonic.png)
		{
			Sonic.png = new Png('/Sonic/sonic.png');
		}
	}

	onAttached()
	{
		this.box    = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.twister = new Twist;

		this.viewport.effects.add(this.twister);

		// this.args.fgFilter = `url(#twist)`;
		this.args.bgFilter = `url(#twist)`;
	}

	update()
	{
		if(this.lightDashingCoolDown > 0)
		{
			this.lightDashingCoolDown--;
		}

		const falling = this.args.falling;

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			const direction = this.public.direction;
			const gSpeed    = this.public.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.public.gSpeedMax;

			if(this.spindashCharge)
			{
				this.box.setAttribute('data-animation', 'spindash');
			}
			else if(!this.public.rolling)
			{
				if(Math.sign(this.public.gSpeed) !== direction && Math.abs(this.public.gSpeed - direction) > 5)
				{
					this.box.setAttribute('data-animation', 'skidding');
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

		}
		else
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		super.update();

		// this.twister.args.scale = Math.abs(this.args.gSpeed);

		if(this.skidding && !this.public.rolling && !this.public.falling && !this.spindashCharge)
		{
			if(this.twister)
			{
				this.twister.args.scale = -this.public.gSpeed;
			}
		}
		else if(!this.spindashCharge)
		{
			this.twister.args.scale = 0;
		}
	}

	release_1() // spindash
	{
		const direction = this.public.direction;
		let   dashPower = this.spindashCharge / 40;

		if(dashPower > 1)
		{
			dashPower = 1;
		}

		this.args.rolling = true;

		const dashBoost = dashPower * 80 * direction;

		if(Math.sign(direction) !== Math.sign(dashBoost))
		{
			this.args.gSpeed = dashBoost;
		}
		else
		{
			this.args.gSpeed += dashBoost;
		}

		this.spindashCharge = 0;
	}

	hold_1(button) // spindash
	{
		if(this.args.falling || this.willJump)
		{
			return;
		}

		this.spindashCharge++;

		let dashCharge = this.spindashCharge / 20;

		if(dashCharge > 1)
		{
			dashCharge = 1;
		}

		if(this.twister)
		{
			this.twister.args.scale = 60 * dashCharge * this.public.direction
		}

		this.box.setAttribute('data-animation', 'spindash');
	}

	hold_2()
	{
		if(this.lightDashing)
		{
			return;
		}

		if(this.lightDashingCoolDown > 0)
		{
			return;
		}

		const ring = this.findNearestRing();

		if(ring)
		{
			this.lightDash(ring);

			this.lightDashingCoolDown = 12;
		}
	}

	findNearestRing()
	{
		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		const cells = viewport.getNearbyColCells(this);

		const rings = new Map;

		cells.map(s => s.forEach(a =>
			a instanceof Ring
			&& !a.public.gone
			&& rings.set(this.distanceFrom(a), a)
		));

		const distances = [...rings.keys()];
		const shortest  = Math.min(...distances);

		if(Math.abs(shortest) > 64)
		{
			return;
		}

		const ring = rings.get(shortest);

		return ring
	}

	lightDash(ring)
	{
		let currentAngle;

		let angle = Math.atan2(ring.y - this.y, ring.x - this.x);

		if(this.public.falling)
		{
			currentAngle = this.public.airAngle;
		}
		else
		{
			currentAngle = this.public.groundAngle;

			switch(this.public.mode)
			{
				case MODE_FLOOR:
					currentAngle = currentAngle;
					break;

				case MODE_LEFT:
					currentAngle = -(currentAngle - (Math.PI / 2));
					break;

				case MODE_CEILING:
					currentAngle = -(currentAngle - (Math.PI));
					break;

				case MODE_RIGHT:
					currentAngle = (currentAngle + (Math.PI / 2));
					break;
			}

			if(this.public.direction < 0)
			{
				currentAngle += Math.PI;
			}

			if(currentAngle > Math.PI)
			{
				currentAngle -= Math.PI * 2;
			}
		}

		const angleDiff = Math.abs(currentAngle - angle);

		if(angleDiff >= Math.PI / 2)
		{
			return;
		}

		let dashSpeed = this.distanceFrom(ring);

		if(dashSpeed > 40)
		{
			dashSpeed = 40;
		}

		this.args.float = -1;

		if(this.public.falling || angleDiff > (Math.PI / 8) * 2)
		{
			this.args.gSpeed = 0;
			this.args.xSpeed = Math.round(dashSpeed * Math.cos(angle));
			this.args.ySpeed = Math.round(dashSpeed * Math.sin(angle));

			this.args.airAngle = angle;

			this.public.falling = true;
		}
		else
		{
			this.args.gSpeed = Math.round(dashSpeed * (Math.sign(this.public.gSpeed) || this.public.direction));
			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
			this.args.float  = 0;
		}

		this.args.rolling = false;

		this.lightDashing = true;
	}

	collideA(other)
	{
		if(other instanceof Ring && !other.gone)
		{
			if(this.lightDashing)
			{
				this.args.float   = 0;

				other.gone = other.gone || true;

				const ring = this.findNearestRing();

				if(ring)
				{
					if(this.clearLightDash)
					{
						clearTimeout(this.clearLightDash);
					}

					this.lightDash(ring);

					this.clearLightDash = this.onTimeout(500, () => {
						this.lightDashing = false
						this.args.float   = 0;
					});
				}
				else
				{
					this.lightDashing = false;
					this.args.float   = 0;
				}
			}
		}

		return super.collideA(other);
	}

	get solid() { return false; }
	get canRoll() { return true; }
	get isEffect() { return false; }
	get controllable() { return true; }

}
