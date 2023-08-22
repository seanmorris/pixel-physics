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

		this.hooked = new Set;
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
			this.unhookAll();
		}

		// if(!tiedTo || !tiedTo.args.falling)
		// {
		// 	return false;
		// }

		this.args.falling = true;

		if(this.hooked.size)
		{
			const hooked = [...this.hooked];
			const first = hooked[0];

			if(first.xAxis)
			{
				if(Math.sign(this.args.xSpeed) || Math.sign(this.args.xSpeed) === Math.sign(this.hooked.xAxis))
				{
					if(this.y > tiedTo.y)
					{
						this.args.xSpeed += first.xAxis * 0.25;
					}
					else
					{
						this.args.xSpeed -= first.xAxis * 0.25;
					}
				}
			}

			for(const h of this.hooked)
			{
				h.args.x = this.x;
				h.args.y = this.y + first.args.height + -5;

				h.args.xSpeed = 0;
				h.args.ySpeed = 0;

				h.args.groundAngle = 0;

				if(h.xAxis>0)
				{
					h.args.facing = 'right';
					h.args.direction = +1;
				}
				else if(h.xAxis<0)
				{
					h.args.facing = 'left';
					h.args.direction = -1;
				}

				h.args.cameraMode = 'hooked';
			}

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

		this.hooked.add(other);

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

				if(!this.hooked.size)
				{
					this.args.x = this.def.get('x');
					this.args.y = this.def.get('y');

					this.viewport.setColCell(this);

					return;
				}

				this.unhookAll();

				if(tiedTo.explode)
				{
					for(const h of this.hooked)
					{
						h.args.gSpeed = 0;
					}
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

	unhook(hooked)
	{
		// const hooked = this.hooked;

		// this.hooked = null;

		// if(!hooked)
		// {
		// 	return;
		// }

		if(!this.hooked.has(hooked))
		{
			return;
		}

		this.hooked.delete(hooked);

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

	unhookAll()
	{
		for(const hooked of this.hooked)
		{
			this.unhook(hooked);
		}
	}
}
