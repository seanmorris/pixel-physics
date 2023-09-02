import { Tag } from 'curvature/base/Tag';

import { Bgm } from '../audio/Bgm';
import { Sfx } from '../audio/Sfx';

import { PointActor } from './PointActor';
import { Projectile } from './Projectile';
import { MiniMace } from './MiniMace';
import { MegaMace } from './MegaMace';

export class RedEyeJet extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.gravity  = 0.4;

		this.args.width  = 96;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-red-eye-jet';

		this.args.float = -1;

		this.args.phase = 'idle';

		this.args.hitPoints = this.args.hitPoints || 8;
		this.args.maxSpeed  = 9;

		this.args.bindTo('phase', v => this.args.phaseFrameId = 0);
	}

	wakeUp()
	{
		for(const [type, others] of this.hanging)
		{
			for(const other of others)
			{
				other.setPos();
			}
		}
	}

	collideA(other, type)
	{
		let name;

		if(this.hanging.has(other))
		{
			return false;
		}

		if(this.hanging.has(MiniMace))
		{
			name = 'MINI-MACE';
		}
		else if(this.hanging.has(MegaMace))
		{
			name = 'MEGA-MACE';
		}

		if(!other.controllable && !(other instanceof Projectile))
		{
			return;
		}

		if(other instanceof Projectile)
		{

		}

		if(this.args.hitPoints > 0)
		{
			if(!(other.args.jumping || other.args.rolling || other.dashed) && !(other instanceof Projectile))
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

			this.box.setAttribute('data-phase', 'exploding');
			this.args.phase = 'exploding';

			this.viewport.clearCheckpoints();

			const viewport = this.viewport;

			viewport.onFrameOut(80, () => {
				this.box.setAttribute('data-phase', 'exploded');
				this.args.falling = true;
				this.args.ySpeed  = -12;
				this.noClip = true;

				Sfx.play('OBJECT_DESTROYED');
			});

			// viewport.onFrameOut(100, () => {
			// 	viewport.clearAct(`${other.args.name} BEAT THE ${name}`);
			// });

			viewport.onFrameOut(100, () => {
				this.viewport.args.cutScene = true;
			});

			viewport.onFrameOut(150, () => {
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
			Sfx.play('BOSS_DUDHIT');

			other.args.ySpeed = Math.max(7, Math.abs(other.args.ySpeed));
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

		let damaged = false;

		if(type === 1)
		{
			this.handleDamage(other);
			damaged = true;

			// other.args.x = this.x - (this.args.width / 2) * Math.sign(other.x - this.x);

			if(this.args.hitPoints > 0)
			{
				other.args.xSpeed = -xBounce * 1.25;
				other.args.xSpeed = Math.min(-7, -this.args.xSpeed);

				this.args.hitPoints--;
			}
			else
			{
				other.args.xSpeed = -2;
				other.args.ignore = -2;
			}
		}

		if(type === 3)
		{
			this.handleDamage(other);
			damaged = true;

			// other.args.x = this.x + (this.args.width / 2) * Math.sign(other.x - this.x);

			if(this.args.hitPoints > 0)
			{
				other.args.xSpeed = xBounce * 1.25;
				other.args.xSpeed = Math.max(7, -this.args.xSpeed);

				this.args.hitPoints--;
			}
			else
			{
				other.args.xSpeed = 2;
				other.args.ignore = -2;
			}
		}

		if(damaged && other && other.controller && other.controller.rumble)
		{
			if(this.viewport.settings.rumble)
			{
				other.controller.rumble({
					duration: 120,
					strongMagnitude: 1.0,
					weakMagnitude: 1.0
				});

				this.onTimeout(100, () => {
					other.controller.rumble({
						duration: 100,
						strongMagnitude: 0.0,
						weakMagnitude: 0.5
					});
				});
			}
		}

		if(other instanceof Projectile || type === 1 || type === 3 || type === 0)
		{
			if(!['dead','exploding','damaged','done'].includes(this.args.phase))
			{
				this.args.phase = 'damaged';
				this.args.animation = '';

				this.args.animation = 'damaged';

				if(this.args.hitPoints === 0 && this.args.phase !== 'exploding')
				{
					this.box.setAttribute('data-phase', 'dead');
					this.args.animation = '';
					this.args.phase = 'dead';

					if(typeof ga === 'function')
					{
						ga('send', 'event', {
							eventCategory: 'boss',
							eventAction: 'defeated',
							eventLabel: `${this.viewport.args.actName}::${this.args.id}`
						});
					}
				}

				this.viewport.onFrameOut(20, () => {
					if(this.args.phase === 'intro')
					{
						return;
					}
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

				Sfx.play('BOSS_DAMAGED');
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
			Bgm.stop('ZONE-BOSS');
			Bgm.stop('ACT-BOSS');

			other.args.ignore = -2;
		}

		return true;
	}

	handleDamage(other)
	{
		Sfx.play('BOSS_DAMAGED');

		if(other)
		{
			const label = ['LUCKY SHOT', 'IM GOING EASY', 'OKAY', 'NICE', 'WOW', 'JEEZ', 'DAMN!', 'STOP!'][other.args.popChain.length];

			const reward = {label, points:1000 * other.args.popChain.length, multiplier:1};

			other.args.popChain.push(reward);
			other.args.popCombo += 1;
		}
	}

	update()
	{
		this.args.phaseFrameId++;
		this.args.frameId++;

		if(this.args.phase === 'idle')
		{
			if(this.args.phaseFrameId > 120)
			{
				this.args.phase = 'intro';
			}

			return;
		}

		if(!this.viewport)
		{
			return;
		}

		if(this.args.phase === 'intro')
		{
			if(this.hanging.has(MiniMace))
			{
				for(const mace of this.hanging.get(MiniMace))
				{
					mace.args.ropeLength = 80;
				}

				Bgm.play('ACT-BOSS', {loop:true, interlude:true});
			}

			if(this.hanging.has(MegaMace))
			{
				for(const mace of this.hanging.get(MegaMace))
				{
					mace.args.ropeLength = 96;
				}

				Bgm.play('ZONE-BOSS', {loop:true, interlude:true});
			}

			this.args.maxSpeed = 12;

			if(this.args.phaseFrameId > 240)
			{
				this.args.phase = 'attacking';
			}
		}
		else if(this.hanging.has(MiniMace))
		{
			this.viewport.onFrameOut(45, () => {
				for(const mace of this.hanging.get(MiniMace))
				{
					mace.args.ropeLength = 128;
				}
			});
		}
		else if(this.hanging.has(MegaMace))
		{
			this.viewport.onFrameOut(45, () => {
				for(const mace of this.hanging.get(MegaMace))
				{
					mace.args.ropeLength = 176;
				}
			});
		}

		if(this.args.phase === 'attacking')
		{
			this.args.maxSpeed  = 9;

			if(this.hanging.has(MiniMace))
			{
				for(const mace of this.hanging.get(MiniMace))
				{
					mace.args.float = 0;
				}
			}

			if(this.hanging.has(MegaMace))
			{
				for(const mace of this.hanging.get(MegaMace))
				{
					mace.args.float = 0;
				}
			}

			if(Math.abs(this.viewport.controlActor.x - this.x) > 255)
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

		if(this.args.phase === 'exploding')
		{
			const viewport = this.viewport;

			if(viewport && viewport.args.frameId % 3 === 0)
			{
				const explosion = new Tag('<div class = "particle-explosion">');

				Sfx.play('BOSS_DAMAGED');

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

		if(this.box)
		{
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
		}

		if(this.args.hitPoints)
		{
			if(['attacking', 'intro', 'chasing'].includes(this.args.phase))
			{
				if(Math.abs(this.x - this.viewport.controlActor.x) > 384)
				{
					this.args.x = this.viewport.controlActor.x + Math.sign(this.x - this.viewport.controlActor.x) * 384;
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
			this.args.maxSpeed  = 11;
		}

		if(this.args.phase === 'chasing')
		{
			if(Math.abs(this.x - this.viewport.controlActor.x) < 128)
			{
				this.args.maxSpeed = Math.max(this.args.maxSpeed, this.viewport.controlActor.args.xSpeed);
			}
		}
		else if(Math.abs(this.args.xSpeed) > this.args.maxSpeed)
		{
			this.args.xSpeed = Math.sign(this.args.xSpeed) * this.args.maxSpeed;
		}

		super.update();
	}

	onRendered(event)
	{
		super.onRendered(event);

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

	get solid() { return false; }
}
