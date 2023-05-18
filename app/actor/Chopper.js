import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';
import { Mixin } from 'curvature/base/Mixin';
import { Sfx } from '../audio/Sfx';
import { AirBomb } from './AirBomb';
import { ChainShot } from './ChainShot';
import { EggCapsule } from './EggCapsule';

import { SkateBoard } from './SkateBoard';
import { TitleScreenCard } from '../intro/TitleScreenCard';

export class Chopper extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-chopper';

		this.args.width   = 80;
		this.args.height  = 48;
		this.args.gravity = 0.25;
		this.args.float   = -1;

		this.args.direction = 1;

		this.exploded = false;
		this.explosions = new Set;

		this.contains = new Set;

		this.args.xSpeed = 8;
		this.args.ySpeed = 6;

		this.args.attacker = this.args.attacker || false;

		this.args.color = 3;//Math.trunc(8 * Math.random());

		this.playingSound = false;

		this.activated = false;

		this.targetPoint = [0,0];

		this.damageTimer = 0;

		if(this.args.attacker)
		{
			this.args.hitPoints = 8;
		}

		this.bombs = new Set;
	}

	collideA(other, type)
	{
		if(this.damageTimer || !this.args.attacker)
		{
			return;
		}

		if(other.args.jumping || other.args.rolling)
		{
			const avgSpeed = (other.args.xSpeed + this.args.xSpeed) * 0.5;

			Sfx.play('BOSS_DAMAGED');

			this.damageTimer = 30;

			this.args.hitPoints--;

			other.args.xSpeed = avgSpeed;

			other.args.ySpeed *= -1;

			if(other.args.ySpeed > 0)
			{
				other.args.ySpeed = -3;
			}

			if(this.args.hitPoints <= 0)
			{
				this.destroy();
				this.noClip = true;
				viewport.onFrameOut(60, () => {
					viewport.actors.remove(this);

					viewport.onFrameOut(60, () => {
						const capsule = new EggCapsule({
							x: other.args.x,
							y: other.args.y - 384,
							xSpeed: other.args.gSpeed || other.args.xSpeed
						});
						viewport.spawn.add({object:capsule});
					});

				});
			}
			else
			{
				this.args.xSpeed = -avgSpeed;
			}
		}
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--color'] = 'color';
	}

	update()
	{
		if(this.damageTimer)
		{
			this.args.type = 'actor-item actor-chopper actor-chopper-damaged';
		}
		else
		{
			this.args.type = 'actor-item actor-chopper';
		}

		if(this.args.attacker)
		{
			if(this.damageTimer > 0)
			{
				this.damageTimer--;
			}

			// this.attackUpdate();
		}
		else
		{
			this.introUpdate();
		}
	}

	updateEnd()
	{
		if(this.args.attacker)
		{
			this.attackUpdate();
		}
		else
		{
			super.updateEnd();
			// this.introUpdate();
		}

		for(const bomb of this.bombs)
		{
			bomb.args.x = this.args.x + bomb.xOffset;
		}
	}

	introUpdate()
	{
		if(this.viewport.controlActor)
		{
			this.contains.add(this.viewport.controlActor);
		}

		if(this.viewport.controlActor)
		{
			const actor = this.viewport.controlActor;

			// this.args.xSpeed += 0.1 * actor.xAxis;
			// this.args.ySpeed += 0.1 * actor.yAxis;
		}

		if(this.args.ySpeed > -4)
		{
			this.args.ySpeed -= 0.025;
		}

		for(const explosion of this.explosions)
		{
			explosion.style({
				'--x': this.args.x + explosion.x * this.args.direction
				, '--y': this.args.y
			});
		}

		if(!this.exploded)
		{

			if(!this.playingSound && this.viewport.args.audio, this.viewport.args.frameId - this.playingSound > 10)
			{
				this.playingSound = this.viewport.args.frameId;
				Sfx.play('COPTER_SPIN', {});
			}

			for(const actor of this.contains)
			{
				actor.args.float = -1;
				actor.args.x = this.args.x;// + 24 * this.args.direction;
				actor.args.y = this.args.y;
				actor.args.hidden = true;

				actor.args.xSpeed = this.args.xSpeed;
				actor.args.ySpeed = this.args.ySpeed;
			}
		}
		else
		{
			Sfx.stop('COPTER_SPIN', false);

			this.args.float = 0;

			super.update();

			return;
		}

		super.update();

		if(this.viewport && this.age && this.age % 300 === 0)
		{
			const explosionTag = document.createElement('div');
			explosionTag.classList.add('particle-huge-explosion');
			const explosion = new Tag(explosionTag);

			explosion.style({
				'--x': this.args.x + 18 * this.args.direction
				, '--y': this.args.y - 16
			});

			Sfx.play('OBJECT_DESTROYED');

			const viewport = this.viewport;

			this.viewport.onFrameOut(200, () => {
				viewport.actors.remove(this);
			});

			this.viewport.onFrameOut(10, () => {
				this.noClip = true;
				// viewport.actors.remove(this)
				for(const actor of this.contains)
				{
					this.args.xSpeed = 4;
					this.args.ySpeed = 1;
					actor.args.ySpeed = -12;
					actor.args.xSpeed = 0;
					actor.args.hidden = false;
					actor.args.float  = 0;
				}
			});

			this.args.animation = 'exploded';

			explosion.x = +18;

			this.explosions.add(explosion);

			this.exploded = true;

			this.viewport.particles.add(explosion);
			this.viewport.onFrameOut(30, () => {
				viewport.particles.remove(explosion)
				this.explosions.delete(explosion);
			});

			const board = new SkateBoard({
				x:this.args.x
				, y: this.args.y
				, ySpeed: -10
				, xSpeed: 4 * Math.sign(this.args.xSpeed)
				, groundAngle: Math.PI / 4
				, ignore: -2
			});

			this.viewport.controlActor.args.standingOn = board;

			this.viewport.spawn.add({object:board});
		}

		if(this.viewport && this.age && this.age % 290 === 0)
		{
			const explosionTag = document.createElement('div');
			explosionTag.classList.add('particle-huge-explosion');
			const explosion = new Tag(explosionTag);

			this.explosions.add(explosion);

			explosion.style({
				'--x': this.args.x + 36 * this.args.direction
				, '--y': this.args.y - 32
			});

			explosion.x = 36;

			Sfx.play('OBJECT_DESTROYED');

			this.viewport.particles.add(explosion);
			this.viewport.onFrameOut(30, () => viewport.particles.remove(explosion));
		}

		if(this.viewport && this.age && this.age % 295 === 0)
		{
			const explosionTag = document.createElement('div');
			explosionTag.classList.add('particle-huge-explosion');
			const explosion = new Tag(explosionTag);

			this.explosions.add(explosion);

			explosion.style({
				'--x': this.args.x + 0 * this.args.direction
				, '--y': this.args.y - 24
			});

			explosion.x = 0;

			Sfx.play('OBJECT_DESTROYED');

			this.viewport.particles.add(explosion);
			this.viewport.onFrameOut(30, () => viewport.particles.remove(explosion));
		}

		this.args.falling = true;
	}

	attackUpdate()
	{
		if(this.args.hitPoints <= 0)
		{
			this.args.falling = true;
			this.args.float = 0;
			super.update();
			super.updateEnd();
			return;
		}

		this.args.groundAngle = 0;

		const other = this.viewport.controlActor;

		if(!this.playingSound && this.viewport.args.audio, this.viewport.args.frameId - this.playingSound > 10)
		{
			this.playingSound = this.viewport.args.frameId;
			Sfx.play('COPTER_SPIN', {});
		}

		if(other.args.mode !== 0)
		{
			super.update();
			super.updateEnd();
			return;
		}

		if(!this.activated)
		{
			if(other.args.x > this.args.x + 64)
			{
				const other = this.viewport.controlActor;

				this.args.xSpeed = (other.args.gSpeed || other.args.xSpeed);

				// other.cofocused = this;

				this.viewport.auras.add(this);

				this.activated = this.viewport.args.frameId;
			}

			super.update();
			super.updateEnd();
			return;
		}

		if(!this.chainShot)
		{
			this.chainShot = new ChainShot;
			this.viewport.spawn.add({object:this.chainShot});

			this.chainShot.args.x = this.args.x;
			this.chainShot.args.y = this.args.y;
		}

		if(other.dashed)
		{
			super.update();
			super.updateEnd();
			this.chainShot.args.animation = 'idle';
			return;
		}

		if(Math.floor((this.viewport.args.frameId - this.activated) / 360) % 2 === 0)
		{
			this.bombModeUpdate();
		}
		else
		{
			this.gunModeUpdate();
		}

	}

	gunModeUpdate()
	{
		const other = this.viewport.controlActor;

		if(other.args.dead)
		{
			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
			super.update();
			super.updateEnd();
			this.fireChaingun();
			this.chainShot.args.animation = 'shooting';
			return;
		}

		if(!this.viewport || !this.viewport.controlActor || this.damageTimer)
		{
			if(this.damageTimer)
			{
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;

				this.chainShot.args.animation = 'idle';
			}

			super.update();
			super.updateEnd();
			this.lockPosition();
			// this.fireChaingun();
			this.chainShot.args.animation = 'idle';
			return;
		}

		if(Math.abs(other.args.gSpeed) > 4 || other.args.falling)
		{
			this.targetPoint[0] = other.args.x + (-96 + -Math.min(64, Math.abs(other.args.gSpeed*4))) * Math.sign(other.args.gSpeed);
			this.targetPoint[1] = other.args.y + (-40 + -Math.min(0, Math.abs(other.args.gSpeed)));
		}

		let factor = 1;

		if(other.args.jumping && Math.abs(other.args.xSpeed) < 15 && Math.sign(other.args.xSpeed) === Math.sign(this.args.x - other.args.x))
		{
			console.log(Math.sign(other.args.xSpeed), Math.sign(this.args.x - other.args.x));

			factor = 0.25;
		}

		if(other.args.x < this.args.x)
		{
			this.args.facing = 'left';
		}
		else
		{
			this.args.facing = 'right';
		}

		this.args.xSpeed = factor * Math.min(25, Math.abs(0.35 * (this.args.x - this.targetPoint[0]))) * -Math.sign(this.args.x - this.targetPoint[0]);
		this.args.ySpeed = factor * Math.min(25, Math.abs(0.20 * (this.args.y - this.targetPoint[1]))) * -Math.sign(this.args.y - this.targetPoint[1]);

		this.args.falling = true;

		this.args.direction = this.args.facing === 'left' ? -1:1;

		super.update();
		super.updateEnd();

		this.lockPosition();

		if(Math.abs(other.args.y - this.args.y) < 48 && !other.args.falling)
		{
			this.fireChaingun();

			this.chainShot.args.animation = 'shooting';
		}
		else
		{
			this.chainShot.args.animation = 'idle';
		}
	}

	bombModeUpdate()
	{
		const other = this.viewport.controlActor;

		if(this.chainShot)
		{
			this.chainShot.args.animation = 'idle';
		}

		if(!this.viewport || !this.viewport.controlActor || this.damageTimer)
		{
			if(this.damageTimer)
			{
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
			}

			super.update();
			super.updateEnd();
			this.lockPosition();
			return;
		}

		if(Math.abs(other.args.gSpeed) > 4 || other.args.falling)
		{
			this.targetPoint[0] = other.args.x +  (-0 + -Math.min(64, Math.abs(other.args.gSpeed*4))) * Math.sign(other.args.gSpeed);
			this.targetPoint[1] = other.args.y + -128;
		}

		let factor = 1;

		if(other.args.x < this.args.x)
		{
			this.args.facing = 'left';
		}
		else
		{
			this.args.facing = 'right';
		}

		this.args.xSpeed = factor * Math.min(25, Math.abs(0.35 * (this.args.x - this.targetPoint[0]))) * -Math.sign(this.args.x - this.targetPoint[0]);
		this.args.ySpeed = factor * Math.min(25, Math.abs(0.10 * (this.args.y - this.targetPoint[1]))) * -Math.sign(this.args.y - this.targetPoint[1]);

		this.args.falling = true;

		if(this.viewport.args.frameId % 30 === 0)
		{
			const bomb = new AirBomb({
				x: this.args.x + (16 * Math.sign(this.args.direction)),
				y: this.args.y,
				xSpeed: this.args.xSpeed,
				ySpeed: this.args.ySpeed,
			});

			bomb.xOffset = (16 * Math.sign(this.args.direction));

			this.bombs.add(bomb);

			this.viewport.spawn.add({object:bomb});
		}

		this.args.direction = this.args.facing === 'left' ? -1:1;

		super.update();
		super.updateEnd();

		this.lockPosition();
	}

	fireChaingun()
	{
		const shotX = 56 * Math.sign(this.args.direction);
		const shotY = 0;

		this.chainShot.args.x = this.args.x + shotX;
		this.chainShot.args.y = this.args.y + shotY;

		this.chainShot.args.xSpeed = this.args.xSpeed;
		this.chainShot.args.ySpeed = this.args.ySpeed;

		this.viewport.setColCell(this.chainShot);

		if(this.args.direction > 0)
		{
			this.chainShot.args.groundAngle = Math.PI * -0.65;
		}
		else
		{
			this.chainShot.args.groundAngle = Math.PI * 0.65;
		}

		this.chainShot.args.shooting = true;

		const length = this.chainShot.castRayQuick(
			786
			, -Math.PI * 0.5 - this.chainShot.args.groundAngle
		);

		this.chainShot.args.shooting = false;

		this.chainShot.args.height = length || 786;
	}

	lockPosition()
	{
		{
			const diff = this.args.x - this.targetPoint[0];
			const dist = Math.abs(diff);
			const sign = Math.sign(diff);

			if(dist > 386)
			{
				this.args.x = this.targetPoint[0] + (386 * sign);
			}
		}

		{
			const diff = this.args.y - this.targetPoint[1];
			const dist = Math.abs(diff);
			const sign = Math.sign(diff);

			if(dist > 386)
			{
				this.args.y = this.targetPoint[1] + (386 * sign);
			}
		}
	}

	destroy()
	{
		const viewport = this.viewport;

		Sfx.stop('COPTER_SPIN', false);

		viewport.onFrameOut(20, () => {
			const explosionTag = document.createElement('div');
			explosionTag.classList.add('particle-huge-explosion');
			const explosion = new Tag(explosionTag);

			explosion.style({
				'--x': this.args.x + 18 * this.args.direction
				, '--y': this.args.y - 16
			});

			Sfx.play('OBJECT_DESTROYED');

			// this.noClip = true;

			this.args.animation = 'exploded';

			explosion.x = +18;

			this.explosions.add(explosion);

			this.exploded = true;

			viewport.particles.add(explosion);
			viewport.onFrameOut(30, () => {
				viewport.particles.remove(explosion)
				this.explosions.delete(explosion);
			});

			const other = viewport.controlActor;
			other.cofocused = null;

		});

		viewport.onFrameOut(0, () => {
			const explosionTag = document.createElement('div');
			explosionTag.classList.add('particle-huge-explosion');
			const explosion = new Tag(explosionTag);

			this.explosions.add(explosion);

			explosion.style({
				'--x': this.args.x + 36 * this.args.direction
				, '--y': this.args.y - 32
			});

			explosion.x = 36;

			Sfx.play('OBJECT_DESTROYED');

			viewport.particles.add(explosion);
			viewport.onFrameOut(30, () => viewport.particles.remove(explosion));
		});

		viewport.onFrameOut(10, () => {
			const explosionTag = document.createElement('div');
			explosionTag.classList.add('particle-huge-explosion');
			const explosion = new Tag(explosionTag);

			this.explosions.add(explosion);

			explosion.style({
				'--x': this.args.x + 0 * this.args.direction
				, '--y': this.args.y - 24
			});

			explosion.x = 0;

			Sfx.play('OBJECT_DESTROYED');

			viewport.particles.add(explosion);
			viewport.onFrameOut(30, () => viewport.particles.remove(explosion));
		});
	}
}
