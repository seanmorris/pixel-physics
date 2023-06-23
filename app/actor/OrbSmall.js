import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { Sfx } from '../audio/Sfx';

export class OrbSmall extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-orb-small';

		this.args.width   = 18;
		this.args.height  = 24;
		this.args.rolled  = 0;
		this.gSpeedLast = 0;

		this.args.accel = 0.2;
		this.args.decel = this.args.decel || 0.0;

		// this.args.bindTo('x', (v,k,t,d,p) => this.args.rolled += Math.PI * Number(v - p || 0));
		// this.args.bindTo('y', (v,k,t,d,p) => this.args.rolled += Math.abs(Number(v - p || 0)));

		this.args.gravity = 0.4;

		this.args.maxFollow = this.args.maxFollow || null;

		this.args.friction  = this.args.friction || 0.75
		this.args.bounce    = this.args.bounce || 0.5;
		this.args.rollSpeed = 0;
		this.args.rolled    = 0;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--rolled'] = 'rolled';
	}

	update()
	{
		if(!this.viewport || !this.viewport.controlActor)
		{
			return;
		}

		if(this.args.x < -16 + this.viewport.controlActor.args.x)
		{
			if(!this.args.falling)
			{
				this.args.xSpeed = this.args.gSpeed;
			}
			this.args.falling = true;
			this.noClip = true;
		}

		const ySpeed = (this.ySpeedLast - this.args.gravity);

		super.update();

		if(!this.args.falling)
		{
			this.args.rollSpeed = this.args.gSpeed * Math.PI;
		}
		else if(this.args.ySpeed > 0)
		{
			this.args.rollSpeed *= 0.975;
		}

		this.args.rolled += this.args.rollSpeed;

		if(!this.args.falling && ySpeed > 3)
		{
			const volume = Math.max(0.5, Math.min(ySpeed, 16) / 16);

			Sfx.play('HEAVY_THUD', {volume});

			if(this.args.bounce)
			{
				this.args.xSpeed *= this.args.friction;
				this.args.x += this.args.xSpeed;
			}

			this.args.ySpeed = -ySpeed * this.args.bounce;

			this.args.falling = true;

			this.args.y -= 1;
		}
	}

	collideA(other)
	{
		// if(other instanceof this.constructor)
		// {
		// 	this.args.gSpeed = (this.args.gSpeed + other.args.gSpeed) * 0.5
		// 	this.args.xSpeed = (this.args.xSpeed + other.args.xSpeed) * 0.5
		// 	this.args.ySpeed = (this.args.ySpeed + other.args.ySpeed) * 0.5

		// 	this.args.gSpeed += Math.sign(this.args.x - other.args.x);
		// 	this.args.xSpeed += Math.sign(this.args.x - other.args.x);
		// 	this.args.ySpeed += Math.sign(this.args.y - other.args.y);

		// 	Sfx.play('HEAVY_THUD');

		// 	return;
		// }

		if(other.controllable)
		{
			const volume = Math.max(0.5, Math.min(this.args.ySpeed, 16) / 16);

			if(!other.args.startled)
			{
				this.args.gSpeed = 0;
				this.noClip = true;
				this.args.falling = true;
				this.args.xSpeed = 0;
				this.args.ySpeed = -3;
				this.args.float  = 10;
				this.args.rollSpeed *= 2;
				Sfx.play('HEAVY_THUD', {volume});
			}

			if(other.args.rings)
			{
				other.damage();
			}
			else
			{
				other.startle();
			}
		}

		if(this.args.x < this.viewport.controlActor.args.x - 8)
		{
			this.noClip = true;
			return;
		}

		if(this.noClip && other.break && !other.broken)
		{
			this.args.ySpeed *= -1;
			Sfx.play('HEAVY_THUD');
			other.break(this);
		}
	}


	sleep()
	{
		this.viewport.actors.remove(this);
	}

	get controllable() { return false; }
	get solid() { return false; }
}
