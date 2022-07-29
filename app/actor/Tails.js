import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { Spring } from './Spring';

import { SkidDust } from '../behavior/SkidDust';

export class Tails extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.canonical = 'Tails';

		this.behaviors.add(new SkidDust);

		this.args.type      = 'actor-item actor-tails';

		this.jumpForceNormal = 11;
		this.jumpForceSuper  = 16;

		this.accelNormal = 0.15;
		this.accelSuper  = 0.22;

		this.args.accel     = this.accelNormal;
		this.args.decel     = 0.4;

		this.args.flySpeedMax = 25;

		this.args.gSpeedMax = 18;
		this.args.jumpForce = this.jumpForceNormal;

		this.args.weight    = 80;

		this.args.gravity   = 0.5;

		this.args.width  = 16;
		this.args.height = 34;

		this.args.normalHeight  = 32;
		this.args.rollingHeight = 28;;

		this.willStick = false;
		this.stayStuck = false;

		this.sparks = new Set();
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.tails = new Tag('<div class = "tails-tails">');
		this.sprite.appendChild(this.tails.node);

		this.flyingSound = new Audio('/Sonic/tails-flying.wav');

		this.flyingSound.volume = 0.35 + (Math.random() * -0.3);
		this.flyingSound.loop   = true;
	}

	startle()
	{
		super.startle();

		this.args.animation = 'startle';

		this.onNextFrame(() => this.args.animation = 'startle');
	}

	updateStart()
	{
		super.updateStart();

		if(this.args.dead)
		{
			this.args.animation = 'dead';
			return;
		}
	}

	update()
	{
		const falling = this.args.falling;

		if(!this.viewport)
		{
			return;
		}

		if(this.viewport.args.audio && this.flyingSound)
		{
			if(!this.flyingSound.paused)
			{
				this.flyingSound.volume = 0.35 + (Math.random() * -0.3);
			}

			if(this.flyingSound.currentTime > 0.2)
			{
				this.flyingSound.currentTime = 0.0;
			}
		}

		if(!this.box)
		{
			super.update();
			return;
		}

		if(this.args.tailFlyCoolDown > 0)
		{
			this.args.tailFlyCoolDown--;
		}

		if(this.args.tailFlyCoolDown < 0)
		{
			this.args.tailFlyCoolDown++;
		}

		if(this.args.tailFlyCoolDown === 0)
		{
			this.flyingSound.pause();
	 		this.args.flying = false;
		}

		if(!falling)
		{
			this.args.tailFlyCoolDown =  0;

			this.flyingSound.pause();

			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(this.args.grinding)
			{
				this.args.animation = 'grinding';
				this.args.rolling = false;
			}
			else if(this.args.rolling)
			{
				this.args.animation = 'rolling';

			}
			else
			{
				if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
				{
					this.args.animation = 'skidding';
				}
				else if(speed > maxSpeed / 2)
				{
					this.args.animation = 'running';
				}
				else if(this.args.moving && this.args.gSpeed)
				{
					this.args.animation = 'walking';
				}
				else
				{
					this.args.animation = 'standing';
				}
			}
		}
		else if(this.args.flying && !this.args.startled)
		{
			if(this.yAxis > 0)
			{
				this.args.animation = 'jumping';
				this.args.ySpeed = this.args.ySpeed > this.args.jumpForce
					? this.args.ySpeed
					: this.args.jumpForce;
			}
			else
			{
				this.args.animation = 'flying';
			}
		}
		else if(this.args.jumping)
		{
			this.flyingSound.pause();
			this.args.animation = 'jumping';
		}

		if(!this.args.startled)
		{
		}
		else
		{
			this.flyingSound.pause();
			this.args.flying = false;
		}


		super.update();

		if(this.args.hangingFrom)
		{
			this.args.animation = 'hanging';
		}

		if(this.args.grinding && !this.args.falling && this.args.gSpeed)
		{
			const sparkParticle = new Tag(`<div class = "particle-sparks">`);
			const sparkEnvelope = new Tag(`<div class = "envelope-sparks">`);

			sparkEnvelope.appendChild(sparkParticle.node);

			const sparkPoint = this.rotatePoint(
				-this.args.gSpeed * 1.75 * this.args.direction
				, 8
			);

			const flip = Math.sign(this.args.gSpeed);

			sparkEnvelope.style({
				'--x': sparkPoint[0] + this.x
				, '--y': sparkPoint[1] + this.y + Math.random * -3
				, 'z-index': 0
				, 'animation-delay': (-Math.random()*0.25) + 's'
				, '--xMomentum': Math.max(Math.abs(this.args.gSpeed), 4) * flip
				, '--flip': flip
				, '--angle': this.realAngle
				, opacity: Math.random() * 2
			});

			sparkEnvelope.particle = sparkParticle;

			this.viewport.particles.add(sparkEnvelope);

			this.sparks.add(sparkEnvelope);

			this.viewport.onFrameOut(30, () => {
				this.viewport.particles.remove(sparkEnvelope);
				this.sparks.delete(sparkEnvelope);
			});
		}

		if(this.sparks.size)
		{
			for(const spark of this.sparks)
			{
				const sparkPoint = this.rotatePoint(
					1.75 * this.args.direction
					, 8
				);

				spark.style({
					opacity: Math.random() * 2
					, '--x': sparkPoint[0] + this.x
					, '--y': sparkPoint[1] + this.y
				});
			}
		}
	}

	command_0(button)
	{
		if(this.args.hangingFrom)
		{
			super.command_0();
			return;
		}

		super.command_0(button);

		if(!this.args.jumping)
		{
			return
		}

		if(!this.args.falling)
		{
			this.args.tailFlyCoolDown = -80;
			return;
		}

		if(this.args.tailFlyCoolDown === 0)
		{
			this.args.tailFlyCoolDown = 80;
			return;
		}

		if(this.args.ySpeed > 0)
		{
			this.args.ySpeed = 0;
		}

		this.args.tailFlyCoolDown = 80;

		this.args.flying = true;

		this.flyingSound.volume = 0.35 + (Math.random() * -0.3);

		if(this.viewport.args.audio && this.flyingSound.paused)
		{
			this.flyingSound.play();
		}
	}

	hold_0(button)
	{
		if(this.args.flying)
		{
			if(this.args.ySpeed > 0)
			{
				this.args.ySpeed = 0;
			}

			if(Math.random() > 0.8)
			{
				this.flyingSound.volume = 0.35 + (Math.random() * -0.3);
			}

			this.args.tailFlyCoolDown = 80;

			this.args.ySpeed -= Math.min(3, (button.time / 9));

			this.args.ySpeed = Math.max(-5, this.args.ySpeed);
		}
		else
		{
			this.args.flying = true;
		}
	}

	sleep()
	{
		this.flyingSound && this.flyingSound.pause();
	}

	get solid() { return false; }
	get canRoll() { return true; }
	get canFly() { return true; }
	get isEffect() { return false; }
	get controllable() { return !this.args.npc; }
}
