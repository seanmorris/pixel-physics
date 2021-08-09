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

		this.args.noseAngle = (Math.PI/2) * 3;
		this.args.drillPush = 0;

		this.args.phaseFrameId = 0;
		this.args.frameId      = 0;

		this.args.direction = -1;
		this.args.facing    = 'left';

		this.noClip = true;

		this.args.bindTo('phase', v => this.args.phaseFrameId = 0);
	}

	onAttached()
	{
		this.autoStyle.get(this.box)['--nose-angle'] = 'noseAngle';
		this.autoStyle.get(this.box)['--drill-push'] = 'drillPush';

		this.autoAttr.get(this.box)['data-phase'] = 'phase';

		this.drill = new Tag(`<div class = "drill">`);
		this.body  = new Tag(`<div class = "body">`);
		this.nose  = new Tag(`<div class = "nose">`);

		this.eyeBack = new Tag(`<div class = "eye-back">`);
		this.eyeFore = new Tag(`<div class = "eye-fore">`);

		this.body.appendChild(this.eyeBack.node);
		this.body.appendChild(this.eyeFore.node);

		this.body.appendChild(this.nose.node);

		this.sprite.appendChild(this.body.node);

		this.nose.appendChild(this.drill.node);

		this.attractor = null;
	}

	update()
	{
		this.args.phaseFrameId++;
		this.args.frameId++;

		super.update();

		if(!this.viewport)
		{
			return;
		}

		const viewport = this.viewport;

		viewport.auras.add(this);

		const mainChar = this.viewport.controlActor;

		if(!mainChar)
		{
			return;
		}

		if(!this.attractor)
		{
			this.attractor = {};

			this.attractor.x = this.x;
			this.attractor.y = this.y;
		}

		const xDiff = Math.abs(this.x - this.attractor.x);
		const yDiff = Math.abs(this.y - this.attractor.y);

		const xSign = Math.sign(this.x - this.attractor.x);
		const ySign = Math.sign(this.y - this.attractor.y);

		switch(this.args.phase)
		{
			case 'idle':

				this.args.ySpeed = 0;

				this.args.alertTo = this.y - 48;

				if(mainChar.x + -this.x > -136)
				{
					this.args.phase = 'alert';
				}

				break;

			case 'damaged':
				this.args.falling   = true
				this.args.float     = -1;

				if(this.args.phaseFrameId > 10)
				{
					this.args.phase = 'stalking';
				}
				break;


			case 'alert':
				this.args.falling   = true
				this.args.float     = -1;

				this.args.drillPush = 1;

				if(this.args.phaseFrameId > 60)
				{
					if(this.y > this.args.alertTo)
					{
						this.args.ySpeed--;
					}
					else
					{
						this.args.y = this.args.alertTo;
						this.args.ySpeed = 0;
					}
				}

				if(this.args.phaseFrameId > 180)
				{
					this.args.phase = 'stalking';
				}

				break;

			case 'stalking': {

				this.args.falling   = true
				this.args.float     = -1;

				this.args.noseAngle = (Math.PI/2)*3;

				this.args.drillPush = 0;

				if(this.args.phaseFrameId > 220)
				{
					this.args.drillPush = 0.5;
				}

				if(this.args.phaseFrameId > 240)
				{
					this.args.noseAngle = this.angleTo({x:mainChar.x, y: Math.max(this.y, mainChar.y)});
				}

				this.args.xSpeed = -xSign * Math.max(1, xDiff/30);
				this.args.ySpeed = -ySign * Math.max(1, yDiff/10);

				this.attractor.x = mainChar.x;
				this.attractor.y = mainChar.y - 128;

				if(this.args.phaseFrameId > 80)
				{
					this.args.phase = 'ready';
				}

				this.args.ySpeed += Math.sin(this.args.frameId / 3) * 3;

				break;
			}

			case 'buzzing': {

				this.attractor.x = mainChar.x;
				this.attractor.y = mainChar.y - 64;

				this.args.falling   = true
				this.args.float     = -1;

				this.args.noseAngle = (Math.PI/2)*3;

				this.args.drillPush = 1;

				if(this.args.phaseFrameId > 220)
				{
					this.args.drillPush = 0.5;
				}

				if(this.args.phaseFrameId > 240)
				{
					this.args.noseAngle = this.angleTo({x:mainChar.x, y: Math.max(this.y, mainChar.y)});
				}

				this.args.xSpeed = -xSign * Math.max(1, xDiff/10);
				this.args.ySpeed = -ySign * Math.max(1, yDiff/8);

				this.args.ySpeed += Math.sin(this.args.frameId / 3) * 3;

				if(this.args.phaseFrameId > 85)
				{
					this.attractor.x = mainChar.x;
					this.attractor.y = mainChar.y - 32;
				}

				if(this.args.phaseFrameId > 100)
				{
					this.args.phase = 'ready';
				}

				break;
			}

			case 'ready': {

				this.args.xSpeed = -xSign * Math.max(1, xDiff/5);
				this.args.ySpeed = -ySign * Math.max(1, yDiff/5);

				this.args.drillPush = 0.75;

				this.attractor.x = mainChar.x + 160 * Math.sign(mainChar.xSpeedLast);
				this.attractor.y = mainChar.y - 160;

				if(this.args.phaseFrameId > 40)
				{
					const dieRoll = Math.random();

					if(dieRoll > 0.6)
					{
						this.args.phase = 'stalking';
					}
					else if(dieRoll > 0.5)
					{
						this.args.phase = 'buzzing';
					}
					else
					{
						this.args.phase = 'attacking';
					}
				}

				this.args.ySpeed += Math.sin(this.args.frameId / 3) * 3;

				break;
			}

			case 'attacking': {
				this.args.float     = -1;
				this.args.falling   = true

				if(this.args.phaseFrameId > 100)
				{
					this.args.phase = 'stalking';
				}

				this.attractor.x = mainChar.x;
				this.attractor.y = mainChar.y - 32;

				this.args.drillPush = 1;

				this.args.float = -1;

				const mainSpeed = mainChar.args.xSpeed || mainChar.args.gSpeed;

				this.args.xSpeed = -xSign * Math.max(1, xDiff/10) + mainSpeed * 1.1;
				this.args.ySpeed = -ySign * Math.max(1, yDiff/10);

				this.args.noseAngle = this.angleTo({x:mainChar.x, y: Math.max(this.y, mainChar.y)});

				break;

			}

			case 'exploding':
				if(this.args.phaseFrameId === 90)
				{
					this.args.falling = true;
					this.args.ySpeed  = -12;
					this.args.xSpeed  = 0;
					this.args.gSpeed  = 0;
					this.noClip = true;

					this.viewport.auras.delete(this);

					this.args.phase = 'exploded';

					if(this.viewport.args.audio)
					{
						this.dieSound.volume = 0.5;
						this.dieSound.play();
					}
				}

				if(this.args.phaseFrameId > 90)
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

	updateEnd()
	{
		super.updateEnd();

		const mainChar = this.viewport.controlActor;

		if(!mainChar)
		{
			return;
		}

		const xDiff = Math.abs(this.x - mainChar.x);
		const yDiff = Math.abs(this.y - mainChar.y);

		const xSign = Math.sign(this.x - mainChar.x);
		const ySign = Math.sign(this.y - mainChar.y);

		switch(this.args.phase)
		{
			case 'attacking':
			case 'stalking':
			case 'ready':
			case 'damaged': {

				if(xDiff > 384)
				{
					this.args.x = mainChar.x + 384 * xSign;
				}

				if(yDiff > 192)
				{
					this.args.y = mainChar.y + 192 * ySign;
				}

				if(!this.args.falling)
				{
					this.args.falling = true;
					this.args.float   = -1;
					this.args.ySpeed  = 0;

					this.args.y--;
				}

				if(this.args.hitPoints <= 0)
				{
					this.viewport.auras.delete(this);
					this.args.phase = 'dead';
					this.noClip = false;
					this.args.float = 0;
				}

				break;
			}
		}

		if(this.args.xSpeed < 0)
		{
			this.args.facing = 'left';
		}
		else if(this.args.xSpeed > 0)
		{
			this.args.facing = 'right';
		}

		this.args.groundAngle = 0;

		switch(this.args.phase)
		{
			case 'attacking':
			case 'stalking':
			case 'ready':
			case 'damaged': {
				if(this.checkBelow(this.x, this.y))
				{
					this.args.falling = true;
					this.args.ySpeed  = -4;
					this.args.y--;
				}
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

		const xSign = Math.sign(this.x - other.x);
		const ySign = Math.sign(this.y - other.y);

		const impactSpeed = Math.min(Math.abs(other.args.xSpeed), 7);
		const impactSign  = Math.sign(other.args.xSpeed);

		if(this.args.hitPoints > 0)
		{
			if(!(other.args.jumping || other.args.rolling || other.dashed))
			{
				this.args.phase = 'stalking';

				other.damage();

				return true;
			}
		}

		if(this.args.phase === 'dead')
		{
			if(!(other.args.jumping || other.args.rolling || other.dashed))
			{
				return true;
			}

			this.args.explodeFrame = this.viewport.args.frameId;
			this.args.phase = 'exploding';
		}

		this.ignores.set(other, 15);


		if(this.args.hitPoints > 1)
		{
			this.args.xSpeed = xSign * impactSpeed / 3;
		}
		else
		{
			this.args.xSpeed  = xSign;
			other.args.xSpeed = -xSign;
		}

		if(type === 1 || type === 3) // Side collisions
		{
			if(this.viewport.args.audio)
			{
				this.hitSound.currentTime = 0;
				this.hitSound.volume = 0.35 + (Math.random() * -0.15);
				this.hitSound.play();
			}

			other.args.x = this.x + (this.args.width / 2) * -Math.sign(other.args.xSpeed);

			if(this.args.hitPoints > 0)
			{
				if(this.args.hitPoints > 0)
				{
					this.args.phase   = 'damaged';
					other.args.xSpeed = -xSign * impactSpeed;
					this.args.hitPoints--;
				}
				else
				{
					this.args.phase = 'dead';
					other.args.xSpeed = -xSign * 2;
					other.args.ignore = -2;
				}
			}
		}

		if(type === 2) // Collide from bottom
		{
			if(this.viewport.args.audio)
			{
				this.dudSound.currentTime = 0;
				this.dudSound.volume = 0.35 + (Math.random() * -0.15);
				this.dudSound.play();
			}

			if(other.args.falling)
			{
				this.args.ySpeed = other.args.ySpeed;

				other.args.ySpeed = Math.max(7, Math.abs(other.args.ySpeed));
			}
		}

		if(type === 0) // Collide from top
		{
			other.args.y    = this.y - this.args.height;
			const animation = other.args.animation;
			const ySpeed    = other.args.ySpeed;

			this.onNextFrame(() => {
				other.args.ySpeed = -Math.floor(Math.abs(ySpeed)) || -4;
			});

			if(this.viewport.args.audio)
			{
				this.hitSound.currentTime = 0;
				this.hitSound.volume = 0.35 + (Math.random() * -0.15);
				this.hitSound.play();
			}

			if(this.args.hitPoints > 0)
			{
				if(this.args.hitPoints > 0)
				{
					this.args.phase   = 'damaged';
					this.args.hitPoints--;
				}
				else
				{
					this.args.phase = 'dead';
				}
			}
		}

		if(type === 1 || type === 3 || type === 0)
		{
			if(!['dead','exploding','damaged','exploded'].includes(this.args.phase))
			{
				this.args.ySpeed = 0;

				if(this.args.hitPoints <= 0)
				{
					if(['dead', 'exploding', 'exploded'].includes(this.args.phase))
					{
						this.args.phase = 'exploding';
					}
					else if(!['dead', 'exploding','damaged','exploded'].includes(this.args.phase))
					{
						this.args.phase = 'dead';
					}

					this.args.xSpeed = 0;
				}
			}

			const gSpeed = other.args.gSpeed;

			other.args.gSpeed = -0.35 * gSpeed;

			if(other.args.rolling)
			{
				this.onNextFrame(() => {
					other.args.gSpeed = -0.35 * gSpeed;
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


	get solid() {return false}
	get rotateLock() {return true}
}
