import { Sheild } from './Sheild';

export class ElectricSheild extends Sheild
{
	template = `<div class = "sheild electric-sheild [[boosted]]"></div>`;
	type = 'electric';
	jumps = 3;
	attract = new Set;
	magnetism = 0;
	magnetTimeout = false;

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
		this.magnetism = 0;

		for(const ring of this.attract)
		{
			this.onTimeout(3000, () => {
				ring.args.x = ring.def.get('x');
				ring.args.y = ring.def.get('y');
				host.viewport.auras.delete(ring);
				host.viewport.setColCell(ring);
				ring.restore = true;
				ring.args.float = -1;
				ring.noClip = false;
				ring.args.xSpeed  = 0;
				ring.args.ySpeed  = 0;
			});

			this.attract.delete(ring);
		}
	}

	hold_6(host, button)
	{
		host.args.xOff  = 0;
		host.args.yOff  = 32;

		this.args.boosted = 'boosted';

		this.magnetism = Math.max(0, button.pressure - 0.25);

		host.pinch(220 * this.magnetism, 0);

		if(!this.magnetism)
		{
			for(const ring of this.attract)
			{
				this.onTimeout(100, () => {
					ring.args.gone    = true;
					ring.args.xSpeed  = 0;
					ring.args.ySpeed  = 0;
					ring.args.x = ring.def.get('x');
					ring.args.y = ring.def.get('y');

					this.onTimeout(3000, () => {
						host.viewport.auras.delete(ring);
						host.viewport.setColCell(ring);
						ring.args.float = -1;
						ring.noClip = false;
						ring.restore = true;
					});
				});

				this.attract.delete(ring);

			}
			return;
		}

		// if(this.attract.size > 32)
		// {
		// 	return;
		// }

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

		const ring = host.findNearestActor(findRing, this.magnetism * 512);

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

		if(!this.sample)
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

			// this.args.boosted = '';
		}

		for(const ring of this.attract)
		{
			if(!ring)
			{
				host.viewport.auras.delete(ring);
				this.attract.delete(ring);
				continue;
			}

			if(ring.args.gone)
			{
				host.viewport.auras.delete(ring);
				this.attract.delete(ring);

				this.onTimeout(100, () => {
					ring.args.xSpeed  = 0;
					ring.args.ySpeed  = 0;
					ring.args.x = ring.def.get('x');
					ring.args.y = ring.def.get('y');
					this.onTimeout(3000, () => {
						host.viewport.auras.delete(ring);
						host.viewport.setColCell(ring);
						ring.args.float = -1;
						ring.noClip = false;
						ring.restore = true;
					});
				});

				continue;
			}

			// if(!ring.vizi)
			// {
			// 	this.onTimeout(5000, () => {
			// 		ring.args.x = ring.def.get('x');
			// 		ring.args.y = ring.def.get('y');
			// 		ring.args.gone = true;
			// 		ring.restore = true;
			// 		ring.xSpeed  = 0;
			// 		ring.ySpeed  = 0;
			// 	});
			// 	continue;
			// }

			ring.noClip = true;

			const xDiff = host.x - ring.x;
			const yDiff = (host.y - host.args.height/2) - ring.y;

			const xDir = Math.sign(xDiff);
			const yDir = Math.sign(yDiff);

			const xSame = Math.sign(ring.args.xSpeed) === xDir;
			const ySame = Math.sign(ring.args.ySpeed) === yDir;

			const xMag = Math.max(this.magnetism, xSame ? 0.5 : 0.65);
			const yMag = Math.max(this.magnetism, ySame ? 0.4 : 0.55);

			// const xMag = Math.max(this.magnetism, xDiff === xDir ? 0.35 : 0.35);
			// const yMag = Math.max(this.magnetism, yDiff === yDir ? 0.125 : 0.135);

			ring.args.groundAngle = 0;

			if(!xSame || Math.abs(ring.args.xSpeed) < 10)
			{
				ring.args.xSpeed += xMag * (xDir * Math.random());
			}

			if(!ySame || Math.abs(ring.args.ySpeed) < 10)
			{
				ring.args.ySpeed += yMag * (yDir * Math.random());
			}

			ring.args.falling = true;
		}
	}
}
