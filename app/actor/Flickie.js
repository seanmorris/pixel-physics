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
		const yDiff = host.y + -this.y + -host.args.height * 0.5;

		const angle = Math.atan2(yDiff, xDiff);
		const distance = Math.sqrt(yDiff ** 2 + xDiff **2);

		const maxDistance = 256;
		const minDistance = 16;

		const airSpeed =  Math.max(
			Math.abs(host.args.gSpeed)
			, Math.abs(host.args.xSpeed)
			, Math.abs(host.args.ySpeed)
			, 2
		);

		let maxSpeed = airSpeed + 3;
		let minSpeed = 2;

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


		if(distance > maxDistance)
		{
			this.args.x = Math.floor(host.x - Math.cos(angle) * maxDistance);
			this.args.y = Math.floor(host.y - Math.sin(angle) * maxDistance);

			this.viewport.setColCell(this);

			if(this.x > host.x)
			{
				facing = 'left';
			}
			else
			{
				facing = 'right';
			}

			maxSpeed += 2;
		}

		const xDir = Math.sign(xDiff);
		const yDir = Math.sign(yDiff);

		const xSame = Math.sign(this.args.xSpeed) === xDir;
		const ySame = this.args.ySpeed && Math.sign(this.args.ySpeed) === yDir;

		const xMag = Math.max(force);
		const yMag = Math.max(force);

		if(!xSame || Math.abs(this.args.xSpeed) < maxSpeed)
		{
			const step = xMag * xDir * fudge;

			if(!this.swapZ && this.public.xSpeed && Math.sign(this.public.xSpeed) !== Math.sign(step))
			{
				this.swapZ = this.viewport.onFrameOut(20, () => {
					this.args.z = this.args.z > -1000 ? -100000 : 100000;
					this.swapZ = false;
				})
			}

			let xSpeed = this.args.xSpeed + step;

			if(Math.abs(this.public.xSpeed) > maxSpeed)
			{
				xSpeed = maxSpeed * Math.sign(this.public.xSpeed);
			}

			this.args.xSpeed = xSpeed;
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

		if(facing)
		{
			this.args.facing = facing;
		}

		if(this.args.ySpeed < 0)
		{
			this.box.classList.add('decending');
			this.box.classList.remove('ascending');
		}
		else
		{
			this.box.classList.remove('decending');
			this.box.classList.add('ascending');
		}
	}

	get solid() { return false; }
	get isGhost() { return true; }
}
