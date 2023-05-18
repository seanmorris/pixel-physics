import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { TruckBody } from './TruckBody';
import { TruckCab } from './TruckCab';
import { Platformer } from '../behavior/Platformer';
import { Sfx } from '../audio/Sfx';

export class GiantTire extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-giant-tire';

		if(this.args.rear)
		{
			this.args.type += ' actor-giant-tire-back';
		}

		this.args.width   = 64;
		this.args.height  = 64;
		this.args.rolled  = 0;
		this.gSpeedLast = 0;

		this.args.accel = 0.0;
		this.args.decel = 0.0;

		this.args.gravity = 0.6;

		this.args.driver  = this.args.driver || null;
		this.args.partner = this.args.partner || null;
		this.args.idler   = null;

		this.args.body = this.args.body || null;
	}

	spawnParts()
	{
		if(this.args.driver || this.args.idler)
		{
			return;
		}

		const idler = this.args.idler = new GiantTire({
			driver:this,
			x: this.args.x - 96,
			y: this.args.y
		});

		const partner = this.args.partner = new GiantTire({
			driver:this,
			rear: true,
			x: this.args.x + 32,
			y: this.args.y
		});

		const idlerPartner = this.args.idlerPartner = new GiantTire({
			driver:this,
			rear: true,
			x: this.args.x - 64,
			y: this.args.y
		});

		const body = this.args.body = new TruckBody({
			driver:this,
			x: this.args.x - 32,
			y: this.args.y - 32
		});

		const cab = this.args.cab = new TruckCab({
			driver:this,
			x: this.args.x + 48,
			y: this.args.y - 28
		});

		this.viewport.spawn.add({object:idler});
		this.viewport.spawn.add({object:partner});
		this.viewport.spawn.add({object:idlerPartner});
		this.viewport.spawn.add({object:body});
		this.viewport.spawn.add({object:cab});

		this.viewport.auras.add(this);
		this.viewport.auras.add(idler);
		this.viewport.auras.add(partner);
		this.viewport.auras.add(idlerPartner);
		this.viewport.auras.add(body);
		this.viewport.auras.add(cab);
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--rolled'] = 'rolled';
	}

	updateStart()
	{
		if(!this.args.driver && !this.args.idler)
		{
			this.spawnParts();
		}

		if(this.args.destroyed && !this.args.falling)
		{
			this.args.type += ' actor-giant-tire-destroyed';
			this.args.idler.args.type += ' actor-giant-tire-destroyed';
			this.args.partner.args.type += ' actor-giant-tire-destroyed';
			this.args.idlerPartner.args.type += ' actor-giant-tire-destroyed';

			this.args.cab.args.type += ' actor-truck-cab-destroyed';
			this.args.body.args.type += ' actor-truck-body-destroyed';

			Sfx.play('ROCK_BREAK_1');
			Sfx.play('OBJECT_DESTROYED');

			if(!this.args.driver)
			{
				let other = this.viewport.controlActor;

				this.viewport.onFrameOut(15, () => other.cofocused = null);

				this.args.body.noClip = true;
				this.args.cab.noClip  = true;

				this.args.body.args.destroyed = true;
				this.args.cab.args.destroyed  = true;

				this.args.body.args.xSpeed = this.gSpeedLast * 1.2;
				this.args.cab.args.xSpeed  = this.gSpeedLast * 1.6;

				this.args.body.args.ySpeed = -6;
				this.args.cab.args.ySpeed  = -14;

				this.args.body.args.falling = true;
				this.args.cab.args.falling  = true;

				this.args.body.args.float = 0;
				this.args.cab.args.float  = 0;
			}

			this.args.ySpeed = -11;
			this.args.xSpeed = this.gSpeedLast * 1.4;
			this.args.falling = true;
		}

		if(this.args.destroyed)
		{
			if(this.args.idler)
			{
				this.args.idler.args.destroyed = true;
				this.args.partner.args.destroyed = true;
				this.args.idlerPartner.args.destroyed = true;

				this.args.idler.args.falling = true;
				this.args.partner.args.falling = true;
				this.args.idlerPartner.args.falling = true;

				this.args.idler.args.xSpeed = this.gSpeedLast * 1.3;
				this.args.partner.args.xSpeed = this.gSpeedLast * 1.4;
				this.args.idlerPartner.args.xSpeed = this.gSpeedLast * 1.3;

				this.args.idler.args.ySpeed = -11;
				this.args.partner.args.ySpeed = -11;
				this.args.idlerPartner.args.ySpeed = -11;

				this.args.idler.args.float= 0;
				this.args.partner.args.float= 0;
				this.args.idlerPartner.args.float= 0;

				this.args.idler.noClip = true;
				this.args.partner.noClip = true;
				this.args.idlerPartner.noClip = true;
			}

			this.args.float = 0;
			this.noClip = true;
			return;
		}

		while(this.getMapSolidAt(this.args.x, this.args.y))
		{
			this.args.y--;
		}

		if(!this.args.idler || !this.viewport.controlActor || this.viewport.controlActor.args.dead)
		{
			super.updateStart();
			return;
		}

		let other = this.viewport.controlActor;

		if(this.age < 36 && this.args.x > -160 + other.args.x)
		{
			super.updateStart();
			return;
		}


		if(other.args.standingOn && other.args.standingOn.isVehicle)
		{
			other = other.args.standingOn;
		}

		if(!this.args.falling)
		{
			if(other.args.gSpeed && this.args.x > -160 + other.args.x)
			{
				this.args.gSpeed *= 0.99;
			}
			else
			{
				this.args.gSpeed = Math.max(this.args.gSpeed, other.args.gSpeed || other.args.xSpeed);
			}
		}
		else
		{
			if(this.args.x > -160 + other.args.x)
			{
				this.args.xSpeed *= 0.99;
			}
			else
			{
				this.args.xSpeed = Math.max(this.args.xSpeed, other.args.xSpeed || other.args.xSpeed);
			}
		}

		if(other.args.x < this.args.x || (other.args.falling && other.args.xSpeed < 0))
		{
			this.args.gSpeed = Math.min(-8, 0.75 * other.args.xSpeed);
		}
		else if(other.args.gSpeed && other.args.gSpeed < 5)
		{
			this.args.gSpeed++;
		}

		const distance = this.args.body.distanceTo(other);

		if(distance < 768 && other.args.jumping && other.fallTime < 120)
		{
			this.args.gSpeed *= 0.9;
		}

		if(distance < 512)
		{
			other.cofocused = this.args.idler;
		}
		else
		{
			other.cofocused = null;
		}

	}

	updateEnd()
	{
		if(!this.args.idler || this.args.destroyed)
		{
			super.updateEnd();
			return;
		}

		for(const region of this.viewport.regionsAtPoint(this.args.x + 80, this.args.y))
		{
			if(region.args.destroyTruck)
			{
				this.args.destroyed = true;
			}
		}

		const idler   = this.args.idler;
		const partner = this.args.partner;
		const idlerPartner = this.args.idlerPartner;

		const bodyX = (0.5 * (this.args.x + idler.args.x));
		const bodyY = -32 + (0.5 * (this.args.y + idler.args.y));
		const bodyA = this.angleTo(idler);
		const bodyD = this.distanceTo(idler);

		this.ensureSpace(idler, 96);
		this.ensureSpace(partner, -16);
		this.ensureSpace(idlerPartner, 80);

		this.args.body.args.x = bodyX;
		this.args.body.args.y = bodyY;

		this.args.body.args.groundAngle = -bodyA;
		this.args.body.args.falling = true;
		this.args.body.args.mode = 0;

		this.args.body.args.xSpeed = this.args.xSpeed || (this.args.gSpeed * Math.cos(bodyA));
		this.args.body.args.ySpeed = this.args.ySpeed || (this.args.gSpeed * Math.sin(bodyA));

		this.args.cab.args.xSpeed = this.args.xSpeed || (this.args.gSpeed * Math.cos(bodyA));
		this.args.cab.args.ySpeed = this.args.ySpeed || (this.args.gSpeed * Math.sin(bodyA));

		this.args.cab.args.x = 0 + bodyX + (80 * Math.cos(bodyA));
		this.args.cab.args.y = 3 + bodyY + (80 * Math.sin(bodyA));

		this.args.cab.args.groundAngle = -bodyA * 1.1;
		this.args.cab.args.falling = true;
		this.args.cab.args.mode = 0;

		if(this.args.gSpeed)
		{
			this.args.animation                   = 'rolling';
			this.args.idler.args.animation        = 'rolling';
			this.args.partner.args.animation      = 'rolling';
			this.args.idlerPartner.args.animation = 'rolling';
		}
		else
		{
			this.args.animation                   = 'idle';
			this.args.idler.args.animation        = 'idle';
			this.args.partner.args.animation      = 'idle';
			this.args.idlerPartner.args.animation = 'idle';
		}

		super.updateEnd();
	}

	ensureSpace(other, spacing)
	{
		let idlerDist = this.distanceFrom(other);
		let absSpace  = Math.abs(spacing);
		let offset    = Math.abs(absSpace - idlerDist);
		let angle     = this.angleTo(other);

		if(spacing > 0 && other.args.x > this.args.x)
		{
			other.args.x = this.args.x - 4;
			other.args.y = this.args.y;

		}
		else if(spacing < 0 && other.args.x < this.args.x)
		{
			other.args.x = this.args.x + 4;
			other.args.y = this.args.y;
		}

		if(this.args.falling)
		{
			other.args.gSpeed = this.args.xSpeed;
			other.args.xSpeed = this.args.xSpeed;
		}
		else if(idlerDist > absSpace)
		{
			other.args.gSpeed = this.args.gSpeed + offset * Math.cos(angle);
			other.args.xSpeed = this.args.xSpeed || this.args.gSpeed;
		}
		else if(idlerDist < absSpace)
		{
			other.args.gSpeed = this.args.gSpeed + -offset * Math.cos(angle);
			other.args.xSpeed = this.args.gSpeed;
		}
		else
		{
			other.args.gSpeed = this.args.gSpeed;
			other.args.xSpeed = this.args.gSpeed;
		}

		if(this.args.falling && other.args.falling)
		{
			other.args.xSpeed = this.args.xSpeed;
			other.args.ySpeed = this.args.ySpeed;

			const bodyD = this.distanceTo(other);
			const bodyA = this.angleTo(other);

			if(bodyD !== 96)
			{
				other.args.x = this.args.x - absSpace * Math.cos(bodyA);
				other.args.y = this.args.y - absSpace * Math.sin(bodyA);
			}
		}
	}

	collideA(other,type)
	{
		if(this.args.destroyed)
		{
			return;
		}

		if(other.break)
		{
			other.break(this);
			return;
		}

		if(other.pop)
		{
			other.pop(this);
			return;
		}

		if(!other.controllable)
		{
			return;
		}

		other.damage(this);
	}
}
