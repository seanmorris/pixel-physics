import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';
// import { Bgm } from '../audio/Bgm';
import { Tag } from 'curvature/base/Tag';
import { EggCapsule } from './EggCapsule';

export class PogoEgg extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width   = 65;
		this.args.height  = 63;
		this.args.type    = 'actor-item actor-pogo-egg';
		this.args.gravity = 0.5;
		this.args.jumpForce = 8.5;
		this.args.decel   = 0;

		this.targetPoint = null;

		this.xTarget = 19216;
		this.yTarget = 1280;

		this.args.expectedAirTime = 0;

		this.args.hp = 8;

		this.args.bounceCount = 0;
	}

	onRendered()
	{
		super.onRendered();

		this.autoStyle.get(this.box)['--stem-length'] = 'stemLength';
	}

	update()
	{
		super.update();

		this.screenLock = this.screenLock || {
			xMin: 20384,
			xMax: 21320,
		};

		if(this.args.hp >= 0)
		{
			if(this.viewport.controlActor)
			{
				if(!this.viewport.controlActor.args.dead)
				{
					this.viewport.controlActor.screenLock = this.viewport.controlActor.screenLock || {
						xMin: 20384,
						xMax: 21320,
					};
				}
			}

			this.args.animation = 'idle';

			if(this.args.damaged > 0)
			{
				this.args.damaged--;

				this.args.animation = 'damaged';
			}
		}

		if(this.args.hp > 0)
		{
			const stemLengthL = this.castRayQuick(32, Math.PI/2, [-16,0], false) || 32;
			const stemLengthR = this.castRayQuick(32, Math.PI/2, [+16,0], false) || 32;

			this.args.stemLength = Math.min(stemLengthL, stemLengthR);
		}
		else
		{
			this.args.stemLength = 0;
		}

		const cycle = 800;
		let target = this.otherDefs.pointA;
		let phase  = this.age % cycle;

		if(phase > cycle * 0.75)
		{
			target = this.otherDefs.pointB;
		}
		else if(phase > cycle * 0.5)
		{
			target = this.otherDefs.pointC;
		}
		else if(phase > cycle * 0.25)
		{
			target = this.otherDefs.pointB;
		}

		if(this.targetPoint !== target)
		{
			this.args.bounceCount = 0;
		}

		this.xTarget = target.x;
		this.yTarget = target.y;
		this.targetPoint = target;

		if(this.args.bounceCount)
		{
			if(this.args.bounceCount % 2)
			{
				this.xTarget = this.targetPoint.x - 32;
			}
			else
			{
				this.xTarget = this.targetPoint.x + 32;
			}
		}

		if(this.args.hp > 0)
		{
			if(!this.args.falling)
			{
				this.args.bounceCount++;
				this.willJump = true;
			}
			else if(this.fallTime === 0)
			{
				const g = this.args.gravity;
				const v = this.args.jumpForce;
				const h = -(this.yTarget - this.args.y);

				const b = g + 2 * v;
				const a = (-b - Math.sqrt(b**2 + 8 * g * -h)) / (-2 * g);
				const d = this.xTarget - this.args.x;

				this.args.xSpeed = d / a;

				this.args.expectedAirTime = a;
			}
		}
		else if(this.args.hp < 0 && this.args.animation !== 'exploding' && this.args.animation !== 'exploded')
		{
			this.args.xSpeed = 0;

			this.args.animation = 'exploding';

			viewport.onFrameOut(80, () => {
				this.args.animation = 'exploded'
				this.args.falling = true;
				this.args.ySpeed  = -16;
				this.noClip = true;

				Sfx.play('OBJECT_DESTROYED');
			});

			viewport.onFrameOut(160, () => {
				const capsule = new EggCapsule({
					x: this.otherDefs.pointB.x,
					y: this.otherDefs.pointB.y - 384,
				});
				viewport.spawn.add({object:capsule});
			});
		}

		if(this.args.animation === 'exploding')
		{
			viewport = this.viewport;

			if(viewport && viewport.args.frameId % 3 === 0)
			{
				const explosion = new Tag('<div class = "particle-explosion">');

				Sfx.play('BOSS_DAMAGED');

				const xOff = this.args.width  * Math.random() - (this.args.width  / 2);
				const yOff = this.args.height * Math.random() - (this.args.height / 2);

				explosion.style({'--x': this.x + xOff, '--y': this.y + yOff + -32});

				viewport.particles.add(explosion);

				setTimeout(() => viewport.particles.remove(explosion), 512);
			}
		}
	}

	collideA(other, type)
	{
		if(!other.controllable)
		{
			return;
		}

		if(!other.args.falling && other.groundTime > 1 && !this.args.damaged && !this.standingUnder.has(other))
		{
			other.damage(this);

			return false;
		}

		if(type === 0 && other.ySpeedLast > 0)
		{
			this.args.ySpeed   =  Math.abs(other.ySpeedLast);
			other.args.ySpeed  = -Math.abs(other.ySpeedLast);

			if(other.args.ySpeed > -6)
			{
				other.args.ySpeed = -6;
			}

			Sfx.play('BOSS_DAMAGED');

			if(!this.args.damaged)
			{
				this.ignores.set(other, 30);
				this.args.damaged = 30;
				this.args.hp--;
			}
		}
		else if(type === 2 && other.args.ySpeed < 0)
		{
			this.args.ySpeed   =  Math.abs(other.args.ySpeed);
			other.args.ySpeed  = -Math.abs(other.args.ySpeed);

			Sfx.play('BOSS_DUDHIT');
		}
		else if(Math.abs(this.args.x - other.args.x) > this.args.width / 2)
		{
			other.args.xSpeed *= -1;
			this.args.xSpeed *= -1;

			if(Math.abs(other.args.xSpeed) < 2)
			{
				other.args.xSpeed = 2 * Math.sign(other.args.x - this.args.x);
			}

			if(Math.abs(this.args.xSpeed) < 2)
			{
				this.args.xSpeed  = 2 * Math.sign(other.args.x - this.args.x);
			}

			Sfx.play('BOSS_DAMAGED');

			if(!this.args.damaged)
			{
				// this.ignores.set(other, 30);
				this.args.damaged = 30;
				this.args.hp--;

				this.args.ySpeed = -5 * Math.sign(other.args.y - this.args.y);
			}
		}

		return super.collideA(other, type);
	}

	get solid() {return !this.noClip; };
}
