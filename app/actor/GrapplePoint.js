import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';
import { Spring } from './Spring';
import { Mixin } from 'curvature/base/Mixin';
import { Constrainable } from '../mixin/Constrainable';

export class GrapplePoint extends Mixin.from(PointActor, Constrainable)
{
	constructor(...args)
	{
		super(...args);

		// this.args.width  = this.args.width  || 32;
		// this.args.height = this.args.height || 32;

		this.args.width  = 28;
		this.args.height = 16;

		this.args.type   = 'actor-item actor-grapple-point';

		this.ignoreOthers = new Set;

		this.args.gravity = 0.6;

		// this.noClip = true;
		this[Spring.WontSpring] = true;
	}

	updateEnd()
	{
		super.update();

		const tiedTo = this.others.tiedTo;

		if(tiedTo)
		{
			this.setPos();
		}
		else
		{
			this.noClip = true;
		}

		if(!tiedTo)
		{
			this.unhook();
		}

		// if(!tiedTo || !tiedTo.args.falling)
		// {
		// 	return false;
		// }

		this.args.falling = true;

		if(this.hooked)
		{
			if(this.hooked.xAxis)
			{
				if(Math.sign(this.args.xSpeed) || Math.sign(this.args.xSpeed) === Math.sign(this.hooked.xAxis))
				{
					if(this.y > tiedTo.y)
					{
						this.args.xSpeed += this.hooked.xAxis * 0.25;
					}
					else
					{
						this.args.xSpeed -= this.hooked.xAxis * 0.25;
					}
				}
			}

			this.hooked.args.x = this.x;
			this.hooked.args.y = this.y + this.hooked.args.height + -5;

			this.hooked.args.xSpeed = 0;
			this.hooked.args.ySpeed = 0;

			this.hooked.args.groundAngle = 0;

			if(this.hooked.xAxis>0)
			{
				this.hooked.args.facing = 'right';
				this.hooked.args.direction = +1;
			}
			else if(this.hooked.xAxis<0)
			{
				this.hooked.args.facing = 'left';
				this.hooked.args.direction = -1;
			}

			this.hooked.args.cameraMode = 'hooked';
		}

		super.updateEnd();
	}

	update()
	{
	}

	collideA(other)
	{
		if(!other.controllable)
		{
			return false;
		}

		const tiedTo = this.others.tiedTo;

		if(!tiedTo || tiedTo.noClip)
		{
			return false;
		}

		if(other.args.hangingFrom || this.ignoreOthers.has(other))
		{
			return; false;
		}

		if(this.args.ignore)
		{
			return false;
		}

		// if((
		// 	(other.args.falling && Math.abs(other.args.y + -this.args.y + other.args.height) > 8)
		// 	&& (other.args.falling && Math.abs(other.args.y + -this.args.y) > 8)
		// )
		// || !other.controllable
		// || this.hooked)
		// {
		// 	return;
		// }

		other.args.falling = true;
		other.swing = true;

		this.hooked = other;

		this.viewport.auras.add(this);

		this.args.xSpeed = other.args.xSpeed || other.args.gSpeed;

		if(other.args.mode === 2)
		{
			this.args.xSpeed = other.args.xSpeed || -other.args.gSpeed;
		}

		this.args.ySpeed = other.args.ySpeed;

		other.args.xSpeed = 0;
		other.args.ySpeed = 0;
		other.args.gSpeed = 0;

		other.args.ignore = -4;
		other.args.float =  -1;

		other.xLast = other.args.x;
		other.yLast = other.args.y;

		other.args.x = this.args.x;
		other.args.y = this.args.y + other.args.height;

		other.args.hangingFrom = this;
		other.args.jumping = false;

		if(this.others.tiedTo)
		{
			const tiedTo = this.others.tiedTo;

			tiedTo.dispatchEvent(new CustomEvent('hooked'), {detail: {
				hook: this, subject: other
			}});

			tiedTo.activate && tiedTo.activate(other);

			const drop = () => {

				if(!this.viewport)
				{
					return;
				}

				if(!this.hooked)
				{
					this.args.x = this.def.get('x');
					this.args.y = this.def.get('y');

					this.viewport.setColCell(this);

					return;
				}

				this.unhook();

				if(tiedTo.explode)
				{
					this.hooked && (this.hooked.args.gSpeed = 0);

					tiedTo.explode();

					this.args.x = this.def.get('x');
					this.args.y = this.def.get('y');

					this.viewport.setColCell(this);
				}
			};

			if(tiedTo.args.flightTime)
			{
				this.viewport.onFrameOut(tiedTo.args.flightTime, drop);
			}

			tiedTo.onRemove(drop);

			tiedTo.addEventListener('exploded', drop);
		}
	}

	unhook()
	{
		const hooked = this.hooked;

		this.hooked = null;

		if(!hooked)
		{
			return;
		}

		const tiedTo = this.others.tiedTo;

		hooked.args.ignore = hooked.args.float = 0;

		hooked.args.y++;

		hooked.args.xSpeed += tiedTo.xSpeedLast || this.xSpeedLast || 0;
		hooked.args.ySpeed += tiedTo.ySpeedLast || this.ySpeedLast || 0;

		hooked.args.groundAngle = 0;

		hooked.args.hangingFrom = null;

		this.ignoreOthers.add(hooked);

		hooked.args.falling = true;
		hooked.args.jumping = true;

		const viewport = this.viewport;

		viewport.onFrameOut(15, () => {
			this.ignoreOthers.delete(hooked);
			viewport.auras.delete(this);
		});
	}
}
