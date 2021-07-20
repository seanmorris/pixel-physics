import { Sheild } from './Sheild';

export class ElectricSheild extends Sheild
{
	template = `<div class = "sheild electric-sheild [[boosted]]"></div>`;
	protect = true;
	type = 'electric';
	jumps = 3;
	attract = new Set;
	magnetism = 0;
	magnetTimeout = false;

	acquire(host)
	{
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		const invertDamage = event => {

			event.preventDefault();

			const other = event.detail.other;

			other && other.pop && other.pop(host);

			this.onNextFrame(() => host.inventory.remove(this));

			host.removeEventListener('damage', invertDamage);

			host.startle();
		};

		host.addEventListener('damage', invertDamage, {once: true});
	}

	command_0(host, button)
	{
		if(host.canFly)
		{
			return;
		}

		if(this.jumps > 0 && host.args.jumping)
		{
			host.args.ySpeed = 0;
			host.impulse(10, -Math.PI / 2);
			this.jumps--;

			this.args.boosted = 'boosted';

			this.onTimeout(250, () => this.args.boosted = '');

			if(host.viewport.args.audio)
			{
				this.sample.currentTime = 0;
				this.sample.play();
			}

			if(host.xAxis && Math.sign(host.xAxis) !== Math.sign(host.public.xSpeed))
			{
				host.args.xSpeed = 1 * host.xAxis;
			}
		}
	}

	release_6(host, button)
	{
		// this.magnetism = 0;

		// for(const ring of this.attract)
		// {
		// 	this.onTimeout(3000, () => {
		// 		ring.args.x = ring.def.get('x');
		// 		ring.args.y = ring.def.get('y');
		// 		host.viewport.auras.delete(ring);
		// 		host.viewport.setColCell(ring);
		// 		ring.restore = true;
		// 		ring.args.float = -1;
		// 		ring.noClip = false;
		// 		ring.args.xSpeed  = 0;
		// 		ring.args.ySpeed  = 0;
		// 	});

		// 	this.attract.delete(ring);
		// }
	}

	hold_6(host, button)
	{
		host.args.xOff  = 0;
		host.args.yOff  = 32;

		this.args.boosted = 'boosted';

		this.magnetism = Math.max(0, button.pressure - 0.25);

		host.pinch(260 * this.magnetism, 0);

		const Ring = host.viewport.objectPalette.ring;

		const findRing = actor => {

			if(this.attract.has(actor))
			{
				return false;
			}

			if(!(actor instanceof Ring))
			{
				return false;
			}

			if(actor.args.gone)
			{
				return false;
			}

			if(actor.restore)
			{
				return false;
			}

			return true;
		};

		const ring = host.findNearestActor(findRing, this.magnetism * 386);

		if(ring)
		{
			host.viewport.auras.add(ring);

			this.attract.add(ring);
		}
	}

	update(host)
	{
		if(!host.public.falling && !this.magnetTimeout)
		{
			this.magnetTimeout = this.onTimeout(100, () => {
				this.magnetTimeout = false;
				this.args.boosted = '';
			});
		}

		if(!this.sample && host.controllable)
		{
			this.initSample = new Audio('/Sonic/S3K_41.wav');
			this.initSample.volume = 0.15 + (Math.random() * -0.05);

			this.sample = new Audio('/Sonic/S3K_45.wav');
			this.sample.volume = 0.15 + (Math.random() * -0.05);

			if(host.viewport.args.audio)
			{
				this.initSample.play();
			}
		}

		if(host.canFly)
		{
			return;
		}

		if(!host.public.falling)
		{
			this.jumps = 3;
		}

		for(const ring of this.attract)
		{
			if(ring.args.gone)
			{
				this.attract.delete(ring);

				this.onTimeout(500, () => {
					if(!ring.def)
					{
						return;
					}
					ring.args.static  = false;
					ring.args.xSpeed  = 0;
					ring.args.ySpeed  = 0;
					ring.args.x = ring.def.get('x');
					ring.args.y = ring.def.get('y');
					host.viewport.setColCell(ring);
					this.onTimeout(3000, () => {
						host.viewport.auras.delete(ring);
						ring.args.float = -1;
						ring.noClip = false;
						ring.restore = true;
					});
				});

				continue;
			}

			ring.noClip = true;

			const xDiff = host.x - ring.x;
			const yDiff = (host.y - host.args.height/4) - ring.y;

			const angle = Math.atan2(yDiff, xDiff);
			const distance = Math.sqrt(yDiff ** 2 + xDiff **2);

			const maxDistance = 384;

			if(distance > maxDistance)
			{
				ring.args.x = host.x - Math.cos(angle) * maxDistance;
				ring.args.y = host.y - Math.sin(angle) * maxDistance;
			}

			const xDir = Math.sign(xDiff);
			const yDir = Math.sign(yDiff);

			const xSame = Math.sign(ring.args.xSpeed) === xDir;
			const ySame = Math.sign(ring.args.ySpeed) === yDir;

			host.viewport.setColCell(ring);

			const force = this.magnetism || 0.55;

			const xMag = Math.max(force, xSame ? 0.35 : 0.45);
			const yMag = Math.max(force, ySame ? 0.25 : 0.35);

			// const xMag = Math.max(this.magnetism, xDiff === xDir ? 0.35 : 0.35);
			// const yMag = Math.max(this.magnetism, yDiff === yDir ? 0.125 : 0.135);

			ring.args.groundAngle = 0;

			const fudge = this.magnetism ? Math.random() : 1;

			if(!xSame || Math.abs(ring.args.xSpeed) < 8)
			{
				ring.args.xSpeed += xMag * (xDir * fudge);
			}

			if(!ySame || Math.abs(ring.args.ySpeed) < 8)
			{
				ring.args.ySpeed += yMag * (yDir * fudge);
			}

			ring.args.falling = true;
		}
	}
}
