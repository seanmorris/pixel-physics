import { Bindable } from 'curvature/base/Bindable';
import { Sheild } from './Sheild';
import { Sfx } from '../audio/Sfx';
import { Tag } from 'curvature/base/Tag';

export class ElectricSheild extends Sheild
{
	template = `<div class = "sheild electric-sheild [[boosted]]"></div>`;
	protect = true;
	type = 'electric';
	jumps = 3;
	attract = new Set;
	magnetism = 0.25;
	magnetTimeout = false;

	particles = new Set;

	acquire(host)
	{
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		if(host.controllable)
		{
			Sfx.play('ELECTRIC_ACQUIRE');
		}

		const invertDamage = event => {

			if(host.args.currentSheild !== Bindable.make(this))
			{
				return;
			}

			event.preventDefault();

			const other = event.detail.other;

			if(this.immune(host, other, event.detail.type))
			{
				event.detail.immune = true;
				return;
			}

			other && other.damage && other.damage(host, 'electric');

			this.onNextFrame(() => {
				host.args.currentSheild = null;
				host.inventory.remove(this)
			});

			host.removeEventListener('damage', invertDamage);

			host.startle(other);
		};

		host.addEventListener('damage', invertDamage);
	}

	immune(host, other, type = 'normal')
	{
		if(type === 'electric' || type === 'projectile')
		{
			return true;
		}

		return false;
	}

	command_0(host, button)
	{
		if(!host.args.falling)
		{
			return;
		}

		if(host.canFly && ((Math.abs(host.yAxis) < 0.55) || host.args.flying))
		{
			return;
		}

		if(this.jumps > 0 && host.args.jumping)
		{
			host.args.ySpeed = 0;
			host.impulse(10, -Math.PI / 2);
			this.jumps--;

			// this.args.boosted = 'boosted';

			this.onTimeout(250, () => this.args.boosted = '');

			Sfx.play('ELECTRIC_JUMP');

			if(host.xAxis && Math.sign(host.xAxis) !== Math.sign(host.args.xSpeed))
			{
				host.args.xSpeed = 1 * host.xAxis;
			}

			viewport = host.viewport;

			if(!viewport)
			{
				return;
			}

			const sparkParticleL = new Tag(document.createElement('div'));
			const sparkParticleR = new Tag(document.createElement('div'));

			sparkParticleL.classList.add('particle-electric-jump-spark');
			sparkParticleR.classList.add('particle-electric-jump-spark');

			sparkParticleL.style({
				'--x': host.args.x
				, '--y': host.args.y - 30
				, 'z-index': 0
			});

			sparkParticleR.style({
				'--x': host.args.x
				, '--y': host.args.y - 30
				, 'z-index': 0
			});

			sparkParticleL.age = 0;
			sparkParticleL.y   = host.args.y - 30;
			sparkParticleL.x   = host.args.x;
			sparkParticleL.d   = -1;

			sparkParticleR.age = 0;
			sparkParticleR.y   = host.args.y - 30;
			sparkParticleR.x   = host.args.x;
			sparkParticleR.d   = 1;

			viewport.particles.add(sparkParticleL);
			viewport.particles.add(sparkParticleR);

			viewport.onFrameOut(200, () => viewport.particles.remove(sparkParticleL));
			viewport.onFrameOut(200, () => viewport.particles.remove(sparkParticleR));

			this.particles.add(sparkParticleL);
			this.particles.add(sparkParticleR);
		}

		if(host.canFly && Math.abs(host.yAxis) > 0.55)
		{
			return false;
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

	// hold_6(host, button)
	// {
	// 	const pressure = button.pressure;

	// 	this.magnetize(host,pressure);
	// }

	magnetize(host, pressure)
	{
		if(!host.controllable)
		{
			return;
		}

		host.args.xOff  = 0;
		host.args.yOff  = 32;

		// this.args.boosted = 'boosted';

		this.magnetism = Math.max(0.25, pressure);

		// host.pinch(260 * this.magnetism, 0);

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

		const ring = host.findNearestActor(findRing, 256);

		if(ring)
		{
			host.viewport.auras.add(ring);

			this.attract.add(ring);
		}
	}

	update(host)
	{
		for(const sparkParticle of this.particles)
		{
			sparkParticle.age && sparkParticle.style({
				'--x':   sparkParticle.x - (40-(40/(sparkParticle.age * 0.35) ** 2)) * sparkParticle.d
				, '--y': sparkParticle.y + (sparkParticle.age * 0.35)**2
			});

			sparkParticle.age++;
		}

		this.magnetize(host, 2.5);

		if(!host.args.falling && !this.magnetTimeout)
		{
			this.magnetTimeout = this.onTimeout(100, () => {
				this.magnetTimeout = false;
				this.args.boosted = '';
			});
		}

		if(host.canFly)
		{
			// return;
		}

		if(!host.args.falling)
		{
			this.jumps = 3;
		}

		let ringsMoved = 0;

		for(const ring of this.attract)
		{
			if(ring.args.gone)
			{
				this.attract.delete(ring);
				ring.attract = null;

				const viewport = host.viewport;

				viewport.onFrameOut(30, () => {
					if(!ring.def)
					{
						return;
					}
					ring.args.static  = false;
					ring.args.xSpeed  = 0;
					ring.args.ySpeed  = 0;
					ring.args.x = ring.def.get('x');
					ring.args.y = ring.def.get('y');
					viewport.setColCell(ring);
					viewport.onFrameOut(5 * 60, () => {
						viewport.auras.delete(ring);
						ring.args.float = -1;
						ring.noClip = false;
						ring.restore = true;
					});
				});

				continue;
			}

			ring.args.static = false;

			ring.attract = host;
			ring.noClip  = true;

			const xDiff = host.x - ring.x;
			const yDiff = (host.y - host.args.height/2) - ring.y;

			const angle = Math.atan2(yDiff, xDiff);
			const distance = Math.hypot(yDiff, xDiff);

			const maxDistance = 512;

			const xDir = Math.sign(xDiff);
			const yDir = Math.sign(yDiff);

			const xSame = Math.sign(ring.args.xSpeed||0) === xDir;
			const ySame = Math.sign(ring.args.ySpeed||0) === yDir;

			if(distance > maxDistance)
			{
				if(ringsMoved > 45)
				{
					continue;
				}

				ring.args.x = host.x - Math.cos(angle) * maxDistance;
				ring.args.y = host.y - Math.sin(angle) * maxDistance;
			}

			host.viewport.setColCell(ring);

			ringsMoved++;

			const force = (this.magnetism || 0.75) * 2;

			const xMag = Math.max(force, xSame ? 0.45 : 0.55);
			const yMag = Math.max(force, ySame ? 0.45 : 0.45);

			// const xMag = Math.max(this.magnetism, xDiff === xDir ? 0.35 : 0.35);
			// const yMag = Math.max(this.magnetism, yDiff === yDir ? 0.125 : 0.135);

			ring.args.groundAngle = 0;

			const fudge = this.magnetism ? Math.random() : 1;

			if(!xSame || Math.abs(ring.args.xSpeed) < 8 || (distance > maxDistance))
			{
				ring.args.xSpeed += Math.max(0.1, xMag * fudge) * xDir;
			}

			if(!ySame || Math.abs(ring.args.ySpeed) < 8 || (distance > maxDistance))
			{
				ring.args.ySpeed += Math.max(0.1, yMag * fudge) * yDir;
			}

			ring.args.falling = true;
		}
	}
}
