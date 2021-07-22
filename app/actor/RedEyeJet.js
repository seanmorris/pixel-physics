import { Tag } from 'curvature/base/Tag';

import { PointActor } from './PointActor';
import { MiniMace } from './MiniMace';

export class RedEyeJet extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.gravity  = 0.4;

		this.args.width  = 96;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-red-eye-jet';

		this.args.float = -1;

		this.args.phase = 'intro';

		this.args.hitPoints = this.args.hitPoints || 8;
		this.args.maxSpeed  = 9;

		this.ignores = new Map;

		this.dieSound = new Audio('/Sonic/object-destroyed.wav');
		this.hitSound = new Audio('/Sonic/S3K_6E.wav');
	}

	collideA(other, type)
	{
		if(!other.controllable)
		{
			return;
		}

		if(this.args.hitPoints > 0)
		{
			if(!(other.args.jumping || other.args.rolling || other.dashed))
			{
				other.args.xSpeed = -other.args.xSpeed * 1.5;

				other.damage();

				return true;
			}
		}

		if(this.ignores.has(other))
		{
			return true;
		}

		if(this.viewport.args.audio)
		{
			this.hitSound.volume = 0.35 + (Math.random() * -0.15);
			this.hitSound.play();
		}

		if(!this.args.falling && this.args.phase !== 'exploding')
		{
			if(!(other.args.jumping || other.args.rolling || other.dashed))
			{
				return true;
			}

			this.box.setAttribute('data-phase', 'exploding');
			this.args.phase = 'exploding';

			this.viewport.clearCheckpoints(other.args.id);

			const viewport = this.viewport;

			viewport.onFrameOut(80, () => {
				this.box.setAttribute('data-phase', 'exploded');
				this.args.falling = true;
				this.args.ySpeed  = -12;
				this.noClip = true;
				if(this.viewport.args.audio)
				{
					this.dieSound.volume = 0.5;
					this.dieSound.play();
				}
			});

			viewport.onFrameOut(100, () => {
				viewport.clearAct(`${other.args.name} BEAT THE MINI-MACE`);
			});

			viewport.onFrameOut(200, () => {
				this.viewport.args.cutScene = true;
			});

			viewport.onFrameOut(205, () => {
				this.viewport.controlActor.controller.replay({axes: [1,0,0,1]});
				this.viewport.controlActor.readInput();
			});

			viewport.onFrameOut(210, () => {
				this.viewport.controlActor.controller.replay({buttons: [1]});
				this.viewport.controlActor.readInput();
			});

			viewport.onFrameOut(211, () => {
				this.viewport.controlActor.dropDashCharge = 30;
			});
			viewport.onFrameOut(285, () => {
				this.viewport.controlActor.controller.replay({buttons: [0,0,0,0,0,0]});
				this.viewport.controlActor.readInput();
				this.args.phase = 'done';
			});

			viewport.onFrameOut(500, () => {
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;

				this.args.y = -1024;
			});
		}

		this.ignores.set(other, 15);

		if(type === 2)
		{
			other.args.ySpeed = 7;
			return true;
		}

		const xBounce = Math.max(Math.abs(other.args.xSpeed), Math.abs(this.args.xSpeed));

		console.log(xBounce);

		if(this.args.falling)
		{
			this.args.xSpeed = other.args.xSpeed;
		}

		if(type === 1)
		{
			other.args.xSpeed = -xBounce * 1.25;
			other.args.x = this.x - (this.args.width / 2);

			if(other.args.xSpeed < -7)
			{
				other.args.xSpeed = -7;
			}
		}

		if(type === 3)
		{
			other.args.xSpeed = xBounce * 1.25;
			other.args.x = this.x + (this.args.width / 2);

			if(other.args.xSpeed > 7)
			{
				other.args.xSpeed = 7;
			}
		}

		if(type === 1 || type === 3 || type === 0)
		{
			if(!['dead','exploding', 'done'].includes(this.args.phase))
			{
				this.args.phase = 'damaged';
				this.args.animation = '';

				if(this.args.hitPoints >= 0)
				{
					this.args.hitPoints--;
				}

				this.args.animation = 'damaged';

				if(this.args.hitPoints === 0 && this.args.phase !== 'exploding')
				{
					this.box.setAttribute('data-phase', 'dead');
					this.args.animation = '';
					this.args.phase = 'dead';
				}

				this.viewport.onFrameOut(40, () => {
					if(this.args.hitPoints > 0)
					{
						this.args.animation = 'attacking';
						this.args.phase     = 'attacking'
					}
					else if(!['dead', 'exploding', 'done'].includes(this.args.phase))
					{
						this.box.setAttribute('data-phase', 'dead');
						this.args.animation = 'dead';
						this.args.phase     = 'dead';

						this.args.xSpeed = 0;

						other.args.score += 20000;
					}
				});
			}

			if(type === 0)
			{
				other.args.y = this.y - this.args.height;

				const animation = other.args.animation;
				const ySpeed = other.args.ySpeed;

				this.onNextFrame(() => {
					other.args.animation = animation;

					other.args.falling = true;
					other.args.xSpeed = -4 * Math.sign(this.x - other.x);
					other.args.ySpeed = -Math.floor(Math.abs(ySpeed)) || -4;
				});
			}

			const gSpeed = other.args.gSpeed;

			other.args.gSpeed = -gSpeed;

			if(other.args.rolling)
			{
				this.onNextFrame(() => {
					other.args.gSpeed = -gSpeed;
					other.args.rolling = true;
					other.args.direction -Math.sign(gSpeed);
				});
			}
		}

		other.args.ignore = 1;

		if(!this.args.hitPoints)
		{
			other.args.ignore = 20;
		}

		return true;
	}

	update()
	{
		if(this.args.phase === 'intro')
		{
			this.args.maxSpeed  = 9;

			for(const mace of this.hanging.get(MiniMace))
			{
				mace.args.x = this.x
				mace.args.y = this.y + 16;
				mace.args.float = -1;
			}

			if(Math.abs(this.viewport.controlActor.x - this.x) < 8 && this.y < this.viewport.controlActor.y)
			{
				this.args.phase = 'attacking';
			}
		}

		if(this.args.phase === 'attacking')
		{
			this.args.maxSpeed  = 9;

			for(const mace of this.hanging.get(MiniMace))
			{
				mace.args.float = 0;
			}

			if(Math.abs(this.viewport.controlActor.x - this.x) > 256)
			{
				this.args.phase = 'chasing';
			}
		}

		if(this.args.phase === 'chasing')
		{
			if(Math.abs(this.viewport.controlActor.x - this.x) < 8 && this.y < this.viewport.controlActor.y)
			{
				this.args.phase = 'attacking';
			}
		}

		for(const [object, timeout] of this.ignores)
		{
			if(timeout <= 0)
			{
				this.ignores.delete(object);
			}
			else
			{
				this.ignores.set(object, -1 + timeout);
			}
		}

		if(this.args.phase === 'exploding')
		{
			const viewport = this.viewport;

			if(viewport && viewport.args.frameId % 3 === 0)
			{
				const explosion = new Tag('<div class = "particle-explosion">');

				if(viewport.args.audio)
				{
					this.hitSound.currentTime = 0;
					this.hitSound.volume = 0.35 + (Math.random() * -0.15);
					this.hitSound.play();
				}

				const xOff = this.args.width  * Math.random() - (this.args.width  / 2);
				const yOff = this.args.height * Math.random() - (this.args.height / 2);

				explosion.style({'--x': this.x + xOff, '--y': this.y + yOff + -16});

				viewport.particles.add(explosion);

				setTimeout(() => viewport.particles.remove(explosion), 512);
			}

			super.update();

			return;
		}

		if(this.args.phase === 'damaged')
		{
			this.args.xSpeed *= 0.999;
		}

		if(this.x - this.viewport.controlActor.x > 0)
		{
			if(Math.abs(this.x - this.viewport.controlActor.x) > 128)
			{
				this.box.setAttribute('data-looking', 'far-left');
			}
			else if(this.viewport.controlActor.args.direction === -1)
			{
				this.box.setAttribute('data-looking', 'far-left');
			}
			else
			{
				this.box.setAttribute('data-looking', 'left');
			}
		}
		else if(this.x - this.viewport.controlActor.x < 0)
		{
			this.box.setAttribute('data-looking', 'far-right');

			if(Math.abs(this.x - this.viewport.controlActor.x) > 128)
			{
				this.box.setAttribute('data-looking', 'far-right');
			}
			else if(this.viewport.controlActor.args.direction === 1)
			{
				this.box.setAttribute('data-looking', 'far-right');
			}
			else
			{
				this.box.setAttribute('data-looking', 'right');
			}
		}

		if(32 > this.y - this.viewport.controlActor.y)
		{
			this.box.setAttribute('data-ducking', 'true');
		}
		else
		{
			this.box.setAttribute('data-ducking', 'false');
		}

		if(this.args.hitPoints)
		{
			if(['attacking', 'intro', 'chasing'].includes(this.args.phase))
			{
				if(Math.abs(this.x - this.viewport.controlActor.x) > 768)
				{
					this.args.x = this.viewport.controlActor.x + Math.sign(this.x - this.viewport.controlActor.x) * 768;
				}

				this.args.xSpeed += -Math.sign(this.x - this.viewport.controlActor.x) * 0.35;
			}
		}

		if(this.args.hitPoints)
		{
			this.args.falling = true;
			this.args.float = -1;
		}
		else
		{
			this.args.float = 0;
		}


		if(this.args.phase === 'intro' || this.args.phase === 'attacking')
		{
			this.args.maxSpeed  = 9;
		}

		if(this.args.phase === 'chasing')
		{
			this.args.maxSpeed = Math.min(21, Math.abs(this.viewport.controlActor.x - this.x));

			for(const mace of this.hanging.get(MiniMace))
			{
				mace.args.xSpeed = this.args.xSpeed;
			}
		}

		if(Math.abs(this.args.xSpeed) > this.args.maxSpeed)
		{
			this.args.xSpeed = Math.sign(this.args.xSpeed) * this.args.maxSpeed;
		}

		super.update();
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.body = new Tag(`<div class = "body-center">`);
		this.bodyL = new Tag(`<div class = "body-left">`);
		this.bodyR = new Tag(`<div class = "body-right">`);
		this.fireA = new Tag(`<div class = "boost-fire boost-fire-left">`);
		this.fireB = new Tag(`<div class = "boost-fire boost-fire-right">`);
		this.eye = new Tag(`<div class = "orange-eye">`);

		this.box.appendChild(this.body.node);
		this.box.appendChild(this.bodyL.node);
		this.box.appendChild(this.bodyR.node);
		this.box.appendChild(this.fireA.node);
		this.box.appendChild(this.fireB.node);
		this.box.appendChild(this.eye.node);
	}

	get solid() { return true; }
}
