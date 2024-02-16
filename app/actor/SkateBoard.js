import { SnowBoard } from './SnowBoard';
import { Tag } from 'curvature/base/Tag';

export class SkateBoard extends SnowBoard
{
	constructor(...args)
	{
		super(...args);

		this.args.height = 10;
		this.args.width = 12;
		this.args.seatHeight = 12;

		this.sparks = new Set();

		this.args.accelOrig = 0.5;
		this.args.decelOrig = 0.6;

		this.args.decel = 0.6;
		this.args.accel = 0.8;

		this.args.gravity = 0.65;

		this.args.skidTraction = 0.85;
		this.args.jumpForce = 12.5;

		this.args.type = 'actor-item actor-snow-board actor-skate-board';

		this.args.trick = null;
		this.args.seatAngle = 0;

		this.args.gSpeedMax = 36;

		this.trickTimer = 0;

		this.flipReward = false;

		this.args.rotated = 0;

		this.canGrind = true;
		this.fakie = false;

		this.silentSkid = true;

		// this.args.gravity = 0.1;

		this.bindTo('occupant', v => {
			if(!v) return;
			this.args.gSpeed = v.xSpeedLast || 0;
		});

		this.args.bindTo('trick', v => {

			if(!this.args.falling && v !== 'manual')
			{
				return;
			}

			if(!v || this.args.grinding)
			{
				return;
			}

			const reward = {label:'', points:100, multiplier:1};

			switch(v)
			{
				case 'insult':
					reward.label = (this.fakie ? 'fakie ' : '') + 'leanback';
					this.occupant.args.popChain.push(reward);
					this.occupant.args.popCombo += 1;
					break;

				case 'handstand':
					reward.label = (this.fakie ? 'fakie ' : '') + 'handstand';
					this.occupant.args.popChain.push(reward);
					this.occupant.args.popCombo += 1;
					break;

				case 'manual':
					if(this.occupant.args.popCombo)
					{
						reward.label = (this.fakie ? 'fakie ' : '') + 'manual';
						this.occupant.args.popChain.push(reward);
						this.occupant.args.popCombo += 1;
					}
					break;
			}
		});
	}

	update()
	{
		if(!this.args.falling)
		{
			this.args.rolling = (this.args.mode === 1 && this.args.gSpeed > 0) || (this.args.mode === 3 && this.args.gSpeed < 0) || (Math.sign(this.args.gSpeed) === Math.sign(this.args.direction) && !this.xAxis);

			// this.args.hLock = false;
		}
		else
		{
			if(this.args.jumping && this.fallTime === 1)
			{
				this.args.groundAngle += Math.PI / 8;
			}

			// this.args.hLock   = this.modeLast === 0;
			this.args.rolling = false;
		}

		if(!this.args.falling)
		{
			this.flipReward = false;
		}

		if(!this.occupant)
		{
			this.args.width  = 64;
			this.args.height = 12;
		}
		else
		{
			this.args.width  = 24;
			this.args.height = 40;
		}

		if(this.trickTimer > 0)
		{
			this.trickTimer--;
		}
		else
		{
			this.args.trick = null;
			this.trickTimer = 0;
		}

		// if(this.args.falling && Math.abs(this.yAxis) > 0.55)
		// {
		// 	const dir = (this.args.facing === 'left'?-1:1);

		// 	if(this.yAxis)
		// 	{
		// 		this.args.groundAngle += 0.1 * this.yAxis * dir;
		// 	}

		// 	if(this.yAxis > 0 && Math.abs(this.args.groundAngle) > Math.PI * 2)
		// 	{
		// 		const reward = {label:(this.fakie ? 'fakie ' : '') + 'backflip', points:100, multiplier:1};
		// 		this.occupant.args.popChain.push(reward);
		// 		this.occupant.args.popCombo += 1;
		// 		this.flipReward = true;

		// 		console.log(reward);

		// 		this.args.groundAngle = 0;
		// 	}
		// 	else if(this.yAxis < 0 && Math.abs(this.args.groundAngle) > Math.PI * 2)
		// 	{
		// 		const reward = {label:(this.fakie ? 'fakie ' : '') + 'frontflip', points:100, multiplier:1};
		// 		this.occupant.args.popChain.push(reward);
		// 		this.occupant.args.popCombo += 1;
		// 		this.flipReward = true;

		// 		console.log(reward);

		// 		this.args.groundAngle = 0;
		// 	}
		// }

		super.update();

		if(this.args.falling)
		{
			this.args.rotated = this.args.groundAngle;
		}
		else
		{
			this.fakie = this.args.reversing;

			// if(this.groundTime === 2 && this.occupant)
			// {
			// 	const occupant = this.occupant;

			// 	let dropAngle = this.realAngle;
			// 	let rotated = this.args.rotated;

			// 	while(rotated < 0)
			// 	{
			// 		rotated += Math.PI * 2;
			// 	}

			// 	while(rotated > Math.PI * 2)
			// 	{
			// 		rotated -= Math.PI * 2;
			// 	}

			// 	while(dropAngle < 0)
			// 	{
			// 		dropAngle += Math.PI * 2;
			// 	}

			// 	while(dropAngle > Math.PI * 2)
			// 	{
			// 		dropAngle -= Math.PI * 2;
			// 	}

			// 	// console.log(this.args.rotated, rotated, dropAngle);

			// 	// const diff = Math.abs(rotated - dropAngle);
			// 	// const upsidedown = Math.abs(rotated - Math.PI);

			// 	// if((rotated && (diff > Math.PI)) || upsidedown < Math.PI * 0.25)
			// 	// {
			// 	// 	this.ignores.set(occupant, 30);
			// 	// 	occupant.args.standingOn  = null;
			// 	// 	occupant.args.groundAngle = 0;
			// 	// 	occupant.args.y -= Math.max(0, occupant.args.height * Math.cos(this.args.groundAngle));
			// 	// 	occupant.startle();

			// 	// 	occupant.totalCombo(false);
			// 	// }

			// 	// console.log({rotated, dropAngle, diff, upsidedown, a: (diff > Math.PI), b: upsidedown < Math.PI * 0.35});

			// 	// this.args.rotated = 0;
			// }
		}

		if(this.occupant && !this.trickTimer && !this.args.grinding && (this.groundTime > 1 && this.args.trick !== 'manual'))
		{
			this.occupant.totalCombo();
			this.args.trick = null;
		}

		this.ridingAnimation = (this.args.gSpeed || this.args.xSpeed || this.args.ySpeed)
			? 'grinding'
			: 'standing';

		if(this.idleTime > 30)
		{
			this.ridingAnimation = 'idle';
		}

		this.crouching = false;

		if(this.yAxis > 0.55 && !this.args.falling)
		{
			this.ridingAnimation = 'grinding-crouching';
			this.crouching = true;
		}

		this.args.accel = this.args.accelOrig;
		this.args.decel = this.args.decelOrig;

		if(this.crouching)
		{
			// this.args.accel = accelOrig;
			this.args.decel = 0.1;
		}

		this.args.animation  = 'idle-2';

		if(this.args.trick === 'handstand')
		{
			this.ridingAnimation = 'handstand';

			if(this.trickTimer > 20 || this.trickTimer < 10)
			{
				this.ridingAnimation = 'flip';
			}
		}

		if(!this.args.grinding && this.grindReward)
		{
			this.grindReward = null;
		}

		if(this.args.grinding)
		{
			this.ridingAnimation = 'board-grinding';
			this.args.animation  = 'grinding';

			if(this.occupant && this.occupant.args.popCombo)
			{
				if(!this.grindReward)
				{
					const reward = {label:(this.fakie ? 'fakie ' : '') + 'rail grind', points:100, multiplier:1};
					this.grindReward = reward;

					this.occupant.args.popChain.push(reward);
					this.occupant.args.popCombo += 1;
				}
				else
				{
					this.grindReward.points += 10;
				}
			}
		}
		else if(this.args.trick === 'manual' && !this.args.falling)
		{
			this.ridingAnimation = 'manual';
			this.args.animation  = 'manual';
		}
		else  if(this.args.trick === 'insult')
		{
			this.ridingAnimation = 'insult';
		}

		if(this.args.grinding && !this.args.falling)
		{
			// `<div class = "particle-sparks">`

			const sparkTag = document.createElement('div');
			sparkTag.classList.add('particle-sparks');
			const sparkParticle = new Tag(sparkTag);

			// `<div class = "envelope-sparks">`
			const envelopeTag = document.createElement('div');
			envelopeTag.classList.add('envelope-sparks');
			const sparkEnvelope = new Tag(envelopeTag);

			sparkEnvelope.appendChild(sparkParticle.node);

			const sparkPoint = this.rotatePoint(
				10 * 1.75 * this.args.direction
				, 8
			);

			const flip = Math.sign(this.args.gSpeed);

			sparkEnvelope.style({
				'--x': sparkPoint[0] + this.args.x
				, '--y': sparkPoint[1] + this.args.y + Math.random() * -3
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

			const viewport = this.viewport;

			this.viewport.onFrameOut(30, () => {
				viewport.particles.remove(sparkEnvelope);
				this.sparks.delete(sparkEnvelope);
			});
		}
	}

	command_1()
	{
		if(this.args.grinding)
		{
			return;
		}

		if(this.trickTimer > 10)
		{
			return;
		}

		this.args.trick = 'insult';
		this.trickTimer = 30;
	}

	hold_1()
	{
		if(this.trickTimer > 10 || this.args.trick !== 'insult')
		{
			return;
		}

		this.trickTimer = Math.max(15, this.trickTimer);

		this.idleTime = 10;
	}

	release_1()
	{
		if(this.args.trick !== 'insult')
		{
			return;
		}

		this.args.trick = 'insult';
		this.trickTimer = 10;
	}

	command_2()
	{
		if(this.trickTimer > 10)
		{
			return;
		}

		this.args.trick = 'handstand';
		this.trickTimer = 30;
	}

	hold_2()
	{
		if(this.trickTimer > 10 || this.args.trick !== 'handstand')
		{
			return;
		}

		this.args.trick = 'handstand';
		this.trickTimer = Math.max(15, this.trickTimer);

		this.idleTime = 10;
	}

	release_2()
	{
		if(this.args.trick !== 'handstand')
		{
			return;
		}

		this.trickTimer = 10;
	}

	command_3()
	{
		if(this.args.grinding)
		{
			return;
		}

		if(this.args.trick && this.args.falling && this.args.trick !== 'manual')
		{
			return;
		}

		if(this.trickTimer > 10)
		{
			return;
		}

		this.args.trick = 'manual';
		this.trickTimer = 30;
	}

	hold_3()
	{
		if(this.args.falling && this.args.trick === 'manual')
		{
			this.trickTimer = Math.max(15, this.trickTimer);
			return;
		}

		if(this.args.falling || this.args.trick !== 'manual')
		{
			return;
		}

		if(this.trickTimer > 10 && this.args.trick !== 'manual')
		{
			return;
		}

		this.args.trick = 'manual';
		this.trickTimer = Math.max(15, this.trickTimer);

		this.idleTime = 10;
	}

	release_3()
	{
		if(this.args.trick !== 'manual')
		{
			return;
		}

		this.args.trick = 'manual';
		this.trickTimer = 10;
	}
}
