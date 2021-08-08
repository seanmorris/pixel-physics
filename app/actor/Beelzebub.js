import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { CanPop } from '../mixin/CanPop';

export class Beelzebub extends Mixin.from(PointActor)
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-beelzebub';

		this.args.width  = 52;
		this.args.height = 32;

		this.args.float = -1;

		this.args.phase = 'idle';

		this.dieSound = new Audio('/Sonic/object-destroyed.wav');
		this.hitSound = new Audio('/Sonic/S3K_6E.wav');
		this.dudSound = new Audio('/Sonic/S2_59.wav');

		this.args.hitPoints = 8;
	}

	onAttached()
	{
		this.autoAttr.get(this.box)['data-phase'] = 'phase';
	}

	update()
	{
		super.update();

		if(!this.viewport)
		{
			return;
		}

		const viewport = this.viewport;

		if(this.args.hitPoints <= 0)
		{
			this.args.float = 0;

			viewport.auras.delete(this);
		}

		viewport.auras.add(this);

		const mainChar = this.viewport.controlActor;

		if(!mainChar)
		{
			return;
		}

		switch(this.args.phase)
		{
			case 'idle':
				this.args.alertTo = this.y - 64;

				if(mainChar.x + -this.x > -136)
				{
					this.viewport.onFrameOut(30, () => {
						this.args.phase   = 'alert'
					});
				}

				break;

			case 'alert':
				this.args.facing = this.args.xSpeed > 0 ? 'left' : 'right';
				this.args.float  = -1;

				if(this.y > this.args.alertTo)
				{
					this.args.ySpeed--;
				}
				else
				{
					this.viewport.onFrameOut(120, () => {
						this.args.phase = 'attacking'
					});
					this.args.y     = this.args.alertTo;

					this.args.ySpeed = 0;
				}
				break;

			case 'attacking':
				this.args.facing = this.args.xSpeed > 0 ? 'left' : 'right';
				this.args.float  = -1;

				const drawX = Math.sign(mainChar.x + -this.x);
				const drawY = Math.sign(mainChar.y + -this.y + -24);

				this.args.xSpeed += drawX * 1.00 - (Math.random()/10);
				this.args.ySpeed += drawY * 0.25 - (Math.random()/10);

				if(Math.abs(this.args.xSpeed) > 6)
				{
					this.args.xSpeed = 4 * drawX;
				}

				if(Math.abs(this.args.ySpeed) > 8)
				{
					this.args.ySpeed = 4 * drawY;
				}

				if(this.checkBelow(this.x, this.y))
				{
					this.args.ySpeed = -1;
					this.args.y -= 1;
				}

				break;

			case 'exploding':

				if(viewport.args.frameId - this.args.explodeFrame > 30)
				{
					return;
				}

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
				break;
		}
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
				// other.args.xSpeed = -other.args.xSpeed * 1.5;

				other.damage();

				return true;
			}
		}

		if(!this.args.falling && this.args.phase !== 'exploding')
		{
			if(!(other.args.jumping || other.args.rolling || other.dashed))
			{
				return true;
			}

			this.args.phase = 'exploding';
			this.args.explodeFrame = this.viewport.args.frameId;
		}

		this.ignores.set(other, 6);


		if(type === 2)
		{
			if(this.viewport.args.audio)
			{
				this.dudSound.currentTime = 0;
				this.dudSound.volume = 0.35 + (Math.random() * -0.15);
				this.dudSound.play();
			}

			if(other.args.falling)
			{
				other.args.ySpeed = Math.max(7, Math.abs(other.args.ySpeed));
			}

		}

		const xBounce = Math.max(Math.abs(other.args.xSpeed), Math.abs(this.args.xSpeed));

		if(this.args.hitPoints > 1 && this.args.falling)
		{
			this.args.xSpeed = other.args.xSpeed;
		}
		else
		{
			this.args.xSpeed = 0;
		}

		if(type === 1)
		{
			if(this.viewport.args.audio)
			{
				this.hitSound.currentTime = 0;
				this.hitSound.volume = 0.35 + (Math.random() * -0.15);
				this.hitSound.play();
			}

			other.args.x = this.x - (this.args.width / 2);

			if(this.args.hitPoints > 0)
			{
				other.args.xSpeed *= -1;
				// other.args.xSpeed = Math.min(-7, -this.args.xSpeed);

				this.args.hitPoints--;
			}
			else
			{
				// other.args.xSpeed = -2;
				other.args.ignore = -2;
			}
		}

		if(type === 3)
		{
			if(this.viewport.args.audio)
			{
				this.hitSound.currentTime = 0;
				this.hitSound.volume = 0.35 + (Math.random() * -0.15);
				this.hitSound.play();
			}

			other.args.x = this.x + (this.args.width / 2);

			if(this.args.hitPoints > 0)
			{
				other.args.xSpeed *= -1;
				// other.args.xSpeed = Math.max(7, -this.args.xSpeed);

				this.args.hitPoints--;
			}
			else
			{
				// other.args.xSpeed = 2;
				other.args.ignore = -2;
			}
		}

		if(type === 1 || type === 3 || type === 0)
		{
			if(!['dead','exploding','damaged','done'].includes(this.args.phase))
			{
				this.args.phase = 'damaged';
				this.args.animation = '';

				this.args.animation = 'damaged';

				this.args.ySpeed = 0;

				if(this.args.hitPoints === 0 && this.args.phase !== 'exploding')
				{
					this.box.setAttribute('data-phase', 'dead');
					this.args.animation = '';
					this.args.phase = 'dead';
				}

				this.viewport.onFrameOut(20, () => {
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

					// other.args.xSpeed = -4 * Math.sign(this.x - other.x);
					other.args.ySpeed = -Math.floor(Math.abs(ySpeed)) || -4;
				});

				if(this.viewport.args.audio)
				{
					this.hitSound.currentTime = 0;
					this.hitSound.volume = 0.35 + (Math.random() * -0.15);
					this.hitSound.play();
				}
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
			other.args.ignore = -2;
		}

		return true;
	}


	get solid() {return true}
	get rotateLock() {return true}
}
