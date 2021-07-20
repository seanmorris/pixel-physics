import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class GrapplePoint extends PointActor
{
	constructor(...args)
	{
		super(...args);

		// this.args.width  = this.public.width  || 32;
		// this.args.height = this.public.height || 32;

		this.args.width  = 22;
		this.args.height = 32;

		this.args.type   = 'actor-item actor-grapple-point';

		this.ignoreOthers = new Set;

		this.args.gravity = 0.4;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.chain = new Tag('<div class = "chain">');

		this.sprite.appendChild(this.chain.node);
	}

	findNextStep()
	{
		return false;
	}

	update()
	{
		if(!this.args._tiedTo)
		{
			const tiedTo = this.viewport.actorsById[ this.args.tiedTo ];

			this.args._tiedTo = tiedTo;

			return;
		}

		const tiedTo = this.args._tiedTo;

		if(!tiedTo.args.falling)
		{
			this.args.groundAngle = -1.57;
			return false;
		}

		this.args.falling = true;

		const xDist = tiedTo.x - this.x;
		const yDist = tiedTo.y - this.y;

		const angle = Math.atan2(yDist, xDist);
		const dist  = Math.sqrt(yDist**2 + xDist**2);

		const maxDist = this.args.ropeLength || 64;

		this.chain.style({'--distance':Math.min(dist, maxDist)});

		this.args.groundAngle = -(angle + Math.PI / 2);

		const gravityAngle = angle + Math.PI;

		if(dist >= maxDist)
		{
			if(this.hooked && this.hooked.xAxis)
			{
				if(Math.sign(this.args.xSpeed) || Math.sign(this.args.xSpeed) === Math.sign(this.hooked.xAxis))
				{
					this.args.xSpeed += this.hooked.xAxis * 0.5;
				}
			}

			const xNext = tiedTo.x - Math.cos(angle) * maxDist - tiedTo.args.xSpeed;
			const yNext = tiedTo.y - Math.sin(angle) * maxDist - tiedTo.args.ySpeed;

			this.args.xSpeed -= Math.cos(gravityAngle);
			this.args.ySpeed -= Math.sin(gravityAngle);

			this.args.x = xNext;
			this.args.y = yNext;

			this.viewport.setColCell(this);

			if(this.x === tiedTo.x && !tiedTo.args.xSpeed)
			{
				this.args.ySpeed = 0;
			}
		}

		super.update();

		if(this.hooked)
		{
			this.hooked.args.x = this.x;
			this.hooked.args.y = this.y + this.hooked.args.height;

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
		}
	}

	collideB(other)
	{
		const tiedTo = this.args._tiedTo;

		if(!tiedTo || !tiedTo.args.falling)
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

		if(Math.abs(other.y - this.y) > 8 || !other.controllable || this.hooked)
		{
			return;
		}

		other.args.falling = true;

		this.hooked = other;

		this.viewport.auras.add(this);

		this.args.xSpeed = other.args.xSpeed;
		this.args.ySpeed = other.args.ySpeed;

		other.args.xSpeed = 0;
		other.args.ySpeed = 0;
		other.args.gSpeed = 0;

		other.args.ignore = other.args.float = -1;

		other.args.x = this.x;
		other.args.y = this.y + other.args.height;

		other.args.hangingFrom = this;

		// this.dispatchEvent(new CustomEvent('hooked'), {detail: {
		// 	hook: this, subject: other
		// }});

		if(this.args._tiedTo)
		{
			const tiedTo = this.args._tiedTo;

			tiedTo.dispatchEvent(new CustomEvent('hooked'), {detail: {
				hook: this, subject: other
			}});

			tiedTo.activate && tiedTo.activate();

			const drop = () => {

				if(!this.viewport || !this.hooked)
				{
					return;
				}

				if(tiedTo.explode)
				{
					this.hooked.args.gSpeed = 0;

					this.unhook();
					tiedTo.explode();
					this.args.ignore = 30;
					this.args.float = 60;

					this.args.x = this.def.get('x');
					this.args.y = this.def.get('y');

					this.viewport.setColCell(this);

				}
			};

			this.viewport.onFrameOut(75, drop);
			tiedTo.onRemove(drop);
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

		const tiedTo = this.args._tiedTo;

		hooked.args.ignore = hooked.args.float = 0;

		hooked.args.y++;

		hooked.args.xSpeed += tiedTo.xSpeedLast ?? 0;
		hooked.args.ySpeed += tiedTo.ySpeedLast ?? 0;

		hooked.args.hangingFrom = null;

		this.ignoreOthers.add(hooked);

		hooked.args.falling = true;

		this.viewport.onFrameOut(15, () => {
			this.ignoreOthers.delete(hooked);
			this.viewport.auras.delete(this);
		});
	}
}
