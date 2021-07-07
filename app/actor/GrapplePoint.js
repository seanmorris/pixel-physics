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
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.chain = new Tag('<div class = "chain">');

		this.sprite.appendChild(this.chain.node);
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

		super.update();

		const xDist = tiedTo.x - this.x;
		const yDist = tiedTo.y - this.y;


		const angle = Math.atan2(yDist, xDist);
		const dist  = Math.sqrt(yDist**2 + xDist**2);

		const maxDist = 64;

		this.args.groundAngle = -(angle + Math.PI / 2);

		if(dist > maxDist)
		{
			const xNext = tiedTo.x - Math.cos(angle) * maxDist;
			const yNext = tiedTo.y - Math.sin(angle) * maxDist;

			if(Math.abs(xDist) <= 2)
			{
				this.args.ySpeed = 0;

				this.args.x = tiedTo.x
			}

			if(Math.abs(yDist) <= 2)
			{
				this.args.xSpeed = 0;

				this.args.y = tiedTo.y;
			}

			this.args.x = xNext;
			this.args.y = yNext;
		}

		if(this.hooked)
		{
			this.hooked.args.x = this.x;
			this.hooked.args.y = this.y + this.hooked.args.height;

			if(tiedTo.args.xSpeed < 24)
			{
				tiedTo.args.xSpeed += 0.5;
				tiedTo.args.ySpeed -= 0.5;
			}
		}
	}

	collideB(other)
	{
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

			// tiedTo.dispatchEvent(new CustomEvent('hooked'), {detail: {
			// 	hook: this, subject: other
			// }});

			tiedTo.args.xSpeed += 2;
			tiedTo.args.ySpeed += 2;

			tiedTo.launched = true;

			const drop = () => {

				if(!this.viewport || !this.hooked)
				{
					return;
				}

				this.hooked.args.xSpeed = tiedTo.xSpeedLast ?? 0;
				this.hooked.args.ySpeed = tiedTo.ySpeedLast ?? 0;

				this.hooked.args.gSpeed = 0;

				this.unhook();
				tiedTo.explode();
				this.args.ignore = 30;
				// this.viewport.actors.remove(this);
			};

			this.viewport.onFrameOut(65, drop);
			// tiedTo.onRemove(drop);
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

		hooked.args.ignore = hooked.args.float = 0;

		hooked.args.y++;

		hooked.args.hangingFrom = null;

	}
}
