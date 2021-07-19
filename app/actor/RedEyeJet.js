import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

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

		this.args.phase = 'attacking';

		this.args.hitPoints = this.args.hitPoints || 8;

		this.ignores = new Map;
	}

	collideA(other, type)
	{
		if(!other.controllable)
		{
			return;
		}

		if(this.args.phase !== 'exploding' && !(other.args.jumping || other.args.rolling || other.dashed))
		{
			other.damage();

			return true;
		}

		if(this.ignores.has(other))
		{
			return true;
		}

		if(this.args.phase === 'damaged')
		{
			return true;
		}

		if(!this.args.falling)
		{
			this.box.setAttribute('data-phase', 'exploding');
			this.args.phase = 'exploding';


			const viewport = this.viewport;

			viewport.onFrameOut(80, () => {
				this.args.falling = true;
				this.args.ySpeed  = -12;
				this.noClip = true;
			});

			viewport.onFrameOut(100, () => {
				this.viewport.clearAct(`${other.args.name} BEAT THE MINI-MACE`);
			});

			viewport.onFrameOut(180, () => {
				viewport.actors.remove(this);
			});
		}

		this.ignores.set(other, 15);

		if(type === 2)
		{
			other.args.ySpeed = 7;
			return true;
		}

		if((type === 1 || type === 3 || type === -1) && other.args.xSpeed)
		{
			other.args.x = this.x - (this.args.width / 2) * Math.sign(other.args.xSpeed || other.args.direction);
		}

		if(type === 1 || type === 3 || type === 0)
		{
			if(!['dead','exploding'].includes(this.args.phase))
			{
				this.args.phase = 'damaged';
				this.args.animation = '';

				if(this.args.hitPoints > 0)
				{
					this.args.hitPoints--;
				}

				this.args.animation = 'damaged';

				this.viewport.onFrameOut(40, () => {
					if(this.args.hitPoints > 0)
					{
						this.args.animation = 'attacking';
						this.args.phase     = 'attacking'
					}
					else if(!['dead','exploding'].includes(this.args.phase))
					{
						this.box.setAttribute('data-phase', 'dead');
						this.args.animation = 'dead';
						this.args.phase     = 'dead';

						this.args.xSpeed = 0;
					}
				});
			}

			if(this.args.falling)
			{
				this.args.xSpeed = other.args.xSpeed;
			}

			other.args.xSpeed *= -1;

			other.args.falling = true;
			other.args.float   = other.args.float || 1;

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
	}

	update()
	{
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

		if(0 < this.x - this.viewport.controlActor.x)
		{
			this.box.setAttribute('data-looking', 'left');

			if(128 < this.x - this.viewport.controlActor.x)
			{
				this.box.setAttribute('data-looking', 'far-left');
			}
		}
		else if(0 > this.x - this.viewport.controlActor.x)
		{
			this.box.setAttribute('data-looking', 'right');

			if(-128 > this.x - this.viewport.controlActor.x)
			{
				this.box.setAttribute('data-looking', 'far-right');
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
			if(this.args.phase === 'attacking')
			{
				this.args.xSpeed += -Math.sign(this.x - this.viewport.controlActor.x) * 0.35;

				const maxSpeed = 13;

				if(Math.abs(this.args.xSpeed) > maxSpeed)
				{
					this.args.xSpeed = Math.sign(this.args.xSpeed) * maxSpeed;
				}
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

		super.update();
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.eye = new Tag(`<div class = "orange-eye">`);
		this.fireA = new Tag(`<div class = "boost-fire boost-fire-left">`);
		this.fireB = new Tag(`<div class = "boost-fire boost-fire-right">`);

		this.box.appendChild(this.eye.node);
		this.box.appendChild(this.fireA.node);
		this.box.appendChild(this.fireB.node);
	}

	get solid() { return true; }
}
