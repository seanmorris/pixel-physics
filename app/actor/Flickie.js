import { PointActor } from './PointActor';

export class Flickie extends PointActor
{
	noClip = 1;

	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-flickie';

		this.args.float = -1;

		this.args.width  = 16;
		this.args.height = 16;

		this.args.z = -1;

		this.args.palletShift = Math.floor(Math.random() * 8);
	}

	update()
	{
		super.update();

		this.args.standingOn = false;

		const host = this.viewport.controlActor;

		if(!host)
		{
			return;
		}

		this.args.falling = true;
		this.args.float   = -1;

		const force = Math.random();
		let   fudge = Math.random();

		const xDiff = host.x + -this.x;
		const yDiff = host.y + -this.y;

		const angle = Math.atan2(yDiff, xDiff);
		const distance = Math.sqrt(yDiff ** 2 + xDiff **2);

		const maxDistance = 256;
		const minDistance = 64;

		let minSpeed = 1;

		const airSpeed = Math.max(
			Math.abs(host.args.gSpeed)
			, Math.abs(host.args.xSpeed)
			, Math.abs(host.args.ySpeed)
			, minSpeed
		) * 1.1;

		const xSpeedRelativeOriginal = this.args.xSpeed - (host.args.xSpeed || host.args.gSpeed);

		let maxSpeed = airSpeed + 3;

		let facing = null;

		if(distance < minDistance)
		{
			if(Math.abs(this.public.xSpeed) < minSpeed)
			{
				this.args.xSpeed = minSpeed * Math.sign(-0.5 + Math.random());
			}

			if(Math.abs(this.public.ySpeed) < minSpeed)
			{
				this.args.ySpeed = minSpeed * Math.sign(-0.5 + Math.random());
			}
		}
		else if(distance >= maxDistance)
		{
			this.args.x = Math.floor(host.x - Math.cos(angle) * maxDistance);
			this.args.y = Math.floor(host.y - Math.sin(angle) * maxDistance);

			this.args.xSpeed = xDiff / 60 + (host.args.xSpeed || host.args.gSpeed);
			this.args.ySpeed = 0;

			this.viewport.setColCell(this);

			if(this.x > host.x)
			{
				facing = 'left';
			}
			else
			{
				facing = 'right';
			}

			maxSpeed *= 4;
		}
		else
		{

		}

		const xDir = Math.sign(xDiff);
		const yDir = Math.sign(yDiff);

		const xSame = Math.sign(this.args.xSpeed) === xDir;
		const ySame = this.args.ySpeed && Math.sign(this.args.ySpeed) === yDir;

		const xMag = Math.max(force) * 0.35 * (xSame ? 0.85 : 0.55);
		const yMag = Math.max(force) * 0.10 * (xSame ? 0.75 : 1.50);

		if(!xSame || Math.abs(this.args.xSpeed) < maxSpeed)
		{
			const step = xMag * xDir * fudge;

			// if(!this.swapZ && this.public.xSpeed && Math.sign(this.public.xSpeed) !== Math.sign(step))
			// {
			// 	this.swapZ = this.viewport.onFrameOut(1, () => {

			// 		this.swapZ = false;
			// 	})
			// }

			let xSpeed = this.args.xSpeed + step;

			if(Math.abs(this.public.xSpeed) > maxSpeed)
			{
				xSpeed = maxSpeed * Math.sign(this.public.xSpeed);
			}

			this.args.xSpeed = xSpeed;

			if(distance >= maxDistance)
			{
				const xSpeed = host.args.xSpeed || host.args.gSpeed;
				const ySpeed = host.args.ySpeed;

				if(facing)
				{
					this.args.xSpeed = xDiff / 90 + xSpeed;
					this.args.ySpeed = yDiff / 90 + ySpeed;
				}
			}
		}

		if(!facing && this.public.xSpeed < 0)
		{
			facing = 'left';
		}
		else if(!facing)
		{
			facing = 'right';
		}

		if(!ySame || Math.abs(this.public.ySpeed) < maxSpeed)
		{
			let ySpeed = this.public.ySpeed + yMag * yDir;

			if(Math.abs(this.args.ySpeed) > maxSpeed)
			{
				ySpeed = maxSpeed * Math.sign(this.args.ySpeed);
			}

			this.args.ySpeed = ySpeed;
		}

		if(Math.sign(xSpeedRelativeOriginal) && Math.sign(host.args.xSpeed || host.args.gSpeed) !== Math.sign(xSpeedRelativeOriginal))
		{
			if(Math.abs(this.x - host.x) > minDistance || Math.abs(this.y - host.y) > minDistance)
			{
				this.args.z = this.args.z > -1000 ? -100000 : 100000;
			}
		}

		if(facing)
		{
			this.args.facing = facing;
		}

		if(this.args.ySpeed > 0)
		{
			this.onTimeout(250, () => {

				if(this.args.ySpeed <= 0 || airSpeed < 1.5)
				{
					return;
				}

				if(this.box)
				{
					this.box.classList.add('decending');
					this.box.classList.remove('ascending');
				}

			})
		}
		else if(this.box)
		{
			this.box.classList.remove('decending');
			this.box.classList.add('ascending');
		}
	}

	get solid() { return false; }
	get isGhost() { return true; }
}
