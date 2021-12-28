import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';

import { SkidDust } from '../behavior/SkidDust';
import { CanPop } from '../mixin/CanPop';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';

export class BuzzBomber extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-buzz-bomber';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 32;
		this.args.height    = 16;

		this.willStick = false;
		this.stayStuck = false;

		this.args.float = -1;

		this.sample = new Audio('/Sonic/object-destroyed.wav');
		this.sample.volume = 0.6 + (Math.random() * -0.3);

		this.aiming = false;
	}

	onRendered()
	{
		super.onRendered();

		this.flame = new Tag('<div class = "buzz-bomber-flame">');
		this.wings = new Tag('<div class = "buzz-bomber-wings">');

		this.sprite.appendChild(this.flame.node);
		this.sprite.appendChild(this.wings.node);

		if(this.aiming)
		{
			this.box.setAttribute('data-animation', 'aiming');
		}
		else
		{
			const direction = this.args.direction;

			if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(this.args.moving && this.args.gSpeed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}
	}

	update()
	{
		this.args.ySpeed = this.yAxis;

		if(!this.flame)
		{

		}

		if(this.args.xSpeed === 0 && this.viewport)
		{
			this.viewport.onFrameOut(10, () => {
				this.attack();
			});
		}

		this.args.falling = true;
		this.args.flying  = true;

		super.update();
	}

	command_1()
	{
		this.aiming = !this.aiming;

		// if(this.aiming)
		// {
		// 	this.args.xSpeed = 0;
		// 	this.args.ySpeed = 0;
		// }
	}

	command_2()
	{
		if(!this.aiming || !this.viewport)
		{
			return;
		}

		const offset = [0, -24];

		const projectile = new Projectile({
			direction: this.public.direction
			, x: this.args.x + offset[0] + (this.args.xSpeed || this.args.gSpeed)
			, y: this.args.y + offset[1]
			, owner: this
			, xSpeed: this.args.xSpeed || this.args.gSpeed
			, YSpeed: this.args.YSpeed
		});

		projectile.impulse(18, 1.57 + (Math.PI/4) * 1);

		this.viewport.auras.add(projectile);
		this.viewport.spawn.add({object:projectile});
	}

	effect(other)
	{
		super.effect(other);

		this.viewport.spawn.add({object:new Flickie({
			x: this.args.x,
			y: this.args.y,
		})});
	}

	wakeUp()
	{
		if(!this.viewport)
		{
			return;
		}

		const viewport = this.viewport;

		this.sleeping = false;

		this.attack();
	}

	attack()
	{
		if(this.sleeping || this.attacking)
		{
			return;
		}

		if(!this.viewport)
		{
			return;
		}

		const viewport = this.viewport;

		this.args.direction = -1;
		this.args.facing    = 'left';

		this.args.xSpeed = -10;

		this.aiming = false;

		this.attacking = true;

		viewport.onFrameOut(5, () => {
			this.aiming = true;

			viewport.onFrameOut(5, () => {
				let shots = 2;
				const cancelInterval = viewport.onFrameInterval(5, () => {
					this.command_2();
					shots-- || cancelInterval();
				});
			});

		});

		viewport.onFrameOut(50, () => {

			const xSpeed = this.args.xSpeed;
			this.args.xSpeed = 0.5 * -xSpeed;

			viewport.onFrameOut(100, () => {
				this.aiming = false;

				this.attacking = false;

				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
			});
		});
	}

	sleep()
	{
		this.args.x = this.def.get('x');
		this.args.y = this.def.get('y');

		this.onNextFrame(() => {

			if(!this.viewport)
			{
				return;
			}

			this.args.x = this.def.get('x');
			this.args.y = this.def.get('y');

			this.viewport.setColCell(this);

			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
			this.args.pushed = 0;
			this.args.float  = 0;

			this.attacking = false;
			this.sleeping = true;
		});
	}

	get solid() { return false; }
	// get controllable() { return true; }
	get isEffect() { return false; }
}
