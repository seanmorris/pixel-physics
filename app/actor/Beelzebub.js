import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { CanPop } from '../mixin/CanPop';
import { CutScene } from './CutScene';

export class Beelzebub extends Mixin.from(PointActor)
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-beelzebub';

		this.args.width  = 64;
		this.args.height = 32;

		this.args.float = -1;

		this.args.damagers = new Map;

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

		this.args.bindTo('phase', v => this.args.phaseFrameId = 0);

		this.clearScene = new CutScene({src: '/cutscenes/clear-seaview.json'});
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

		this.clearScene.viewport = this.viewport;
	}

	update()
	{
		this.args.phaseFrameId++;
		this.args.frameId++;

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
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
				break;

			case 'intro':

				if(this.args.phaseFrameId > 30)
				{
					this.args.phase = 'stalking';
				}

				break;

			case 'alert':

				if(this.args.phaseFrameId > 4)
				{
					this.args.drillPush = 1;
					this.args.falling   = true
					this.args.float     = -1;

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

				if(this.args.phaseFrameId > 0)
				{
					this.args.phase = 'stalking';
				}

				break;


			case 'damaged':

				if(this.args.hitPoints > 0)
				{
					if(this.args.phaseFrameId > 20)
					{
						this.args.phase = 'stalking';
					}
				}
				else
				{
					if(this.args.phaseFrameId > 6)
					{
						this.args.phase = 'dead';
					}
				}

				break;

			case 'knocked':

				this.args.xSpeed = 0;

				if(this.args.phaseFrameId > 30)
				{
					this.args.phase = 'stalking';
				}

				break;

			case 'dead':
				this.args.float = 0;
				break;

			case 'stalking': {

				this.args.xSpeed = -xSign * Math.max(1, xDiff/25);
				this.args.ySpeed = -ySign * Math.max(1, yDiff/25);

				this.args.ySpeed += Math.sin(this.args.frameId / 3) * 3;

				if(this.pointIsSafe(mainChar.x, mainChar.y - 128))
				{
					this.attractor.x = mainChar.x;
					this.attractor.y = mainChar.y - 128;
				}

				this.args.noseAngle = (Math.PI/2)*3;

				this.args.drillPush = 0;

				if(this.args.phaseFrameId > 10)
				{
					this.args.noseAngle = this.angleTo({x:mainChar.x, y: Math.max(this.y, mainChar.y)});
				}

				if(this.args.phaseFrameId > 20)
				{
					this.args.drillPush = 0.5;
				}

				if(this.args.phaseFrameId > 45)
				{
					this.args.phase = 'ready';
				}

				break;
			}

			case 'buzzing': {

				if(this.pointIsSafe(mainChar.x, mainChar.y + -mainChar.args.height + -34))
				{
					this.attractor.x = mainChar.x;
					this.attractor.y = mainChar.y + -mainChar.args.height + -34;
				}

				this.args.xSpeed = -xSign * Math.max(1, xDiff/15);
				this.args.ySpeed = -ySign * Math.max(1, yDiff/15);

				this.args.noseAngle = (Math.PI/2)*3;

				this.args.drillPush = 1;

				if(this.args.phaseFrameId > 10)
				{
					this.args.drillPush = 0.5;
				}

				if(this.args.phaseFrameId > 20)
				{
					this.args.noseAngle = this.angleTo({x:mainChar.x, y: Math.max(this.y, mainChar.y)});
				}

				if(this.args.phaseFrameId > 30)
				{
					this.args.phase = 'ready';
				}

				break;
			}

			case 'ready': {

				if(this.args.phaseFrameId < 10)
				{
					this.readySide = Math.sign(mainChar.xSpeedLast || mainChar.gSpeedLast);
				}

				if(this.pointIsSafe(mainChar.x + 128 * this.readySide, mainChar.y + -mainChar.args.height + -128))
				{
					this.attractor.x = mainChar.x + 128 * this.readySide;
					this.attractor.y = mainChar.y + -mainChar.args.height + -128;
				}

				this.args.xSpeed = -xSign * Math.max(1, xDiff/15);
				this.args.ySpeed = -ySign * Math.max(1, yDiff/15);

				this.args.ySpeed += Math.sin(this.args.frameId / 3) * 3;

				this.args.drillPush = 0.75;

				if(this.args.phaseFrameId > 40)
				{
					const dieRoll = Math.random();

					if(!mainChar.args.falling)
					{
						if(dieRoll > 0.5)
						{
							this.args.phase = 'swooping';
						}
						else
						{
							this.args.phase = 'attacking';
						}
					}
					else
					{
						if(dieRoll > 0.5)
						{
							this.args.phase = 'buzzing';
						}
						else
						{
							this.args.phase = 'stalking';
						}
					}
				}

				break;
			}

			case 'attacking': {
				this.args.float     = -1;
				this.args.falling   = true

				if(this.args.phaseFrameId > 100)
				{
					this.args.phase = 'stalking';
				}

				if(this.args.phaseFrameId < 50)
				{
					if(this.pointIsSafe(mainChar.x + 256 * (this.readySide || 1), mainChar.y - 32))
					{
						this.attractor.x = mainChar.x + 256 * (this.readySide || 1);
						this.attractor.y = mainChar.y - 32;
					}

					this.args.noseAngle = 0;
				}
				else
				{
					if(this.pointIsSafe(mainChar.x + 256 * (-this.readySide || -1), mainChar.y - 16))
					{
						this.attractor.x = mainChar.x + 256 * (-this.readySide || -1);
						this.attractor.y = mainChar.y - 16;
					}

					this.args.noseAngle = this.angleTo({x:mainChar.x, y: Math.max(this.y, mainChar.y)});
				}

				this.args.drillPush = 1;

				this.args.float = -1;

				const mainSpeed = mainChar.args.xSpeed || mainChar.args.gSpeed;

				this.args.xSpeed = -xSign * Math.max(1, xDiff/10) + mainSpeed * 1.1;
				this.args.ySpeed = -ySign * Math.max(1, yDiff/10);

				break;
			}

			case 'swooping': {

				if(this.pointIsSafe(mainChar.x, mainChar.y - 32))
				{
					this.attractor.x = mainChar.x;
					this.attractor.y = mainChar.y - 32;
				}

				this.args.xSpeed += -xSign * Math.max(1, xDiff/10000);
				this.args.ySpeed += -ySign * Math.max(1, yDiff/10000);

				this.args.noseAngle = this.angleTo({x:mainChar.x, y: Math.max(this.y, mainChar.y)});

				this.args.drillPush = 1;

				this.args.float = -1;

				if(this.args.phaseFrameId > 180)
				{
					this.args.phase = 'stalking';
				}

				const mainSpeed = mainChar.args.xSpeed || mainChar.args.gSpeed;
				break;
			}

			case 'exploding':
				if(this.args.phaseFrameId === 90)
				{
					this.args.falling = true;
					this.args.ySpeed  = -14;
					this.args.xSpeed  = 0;
					this.args.gSpeed  = 0;
					this.noClip = true;

					this.viewport.auras.delete(this);

					this.args.phase = 'exploded';

					this.clearScene.activate(mainChar, this, true);

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

		if(this.args.phase !== 'knocked')
		{
			if(this.args.ySpeed < 0 && !this.pointIsSafe(this.x, this.y + -this.args.height + this.args.ySpeed + -1))
			{
				this.args.ySpeed = 0;
			}
		}

		super.update();
	}

	updateEnd()
	{
		super.updateEnd();

		if(!this.viewport)
		{
			return;
		}

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
			case 'swooping':
			case 'stalking':
			case 'knocked':
			case 'damaged':
			case 'ready': {

				if(xDiff > 384)
				{
					this.args.x = mainChar.x + 384 * xSign;
				}

				if(yDiff > 192)
				{
					this.args.y = mainChar.y + 192 * ySign;
				}

				if(this.args.hitPoints <= 0)
				{
					this.viewport.auras.delete(this);
					this.args.phase = 'dead';
					this.noClip = false;
					this.args.float = 0;

					if(typeof ga === 'function')
					{
						ga('send', 'event', {
							eventCategory: 'boss',
							eventAction: 'defeated',
							eventLabel: `${this.viewport.args.actName}::${this.args.id}`
						});
					}
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
			case 'swooping':
			case 'stalking':
			case 'ready': {
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
		if(this.args.phase === 'exploded')
		{
			return false;
		}

		if(!other.controllable && !other.hazard)
		{
			return true;
		}

		if(type === -1)
		{
			return;
		}

		const xSign = Math.sign(this.x - other.x);
		const ySign = Math.sign(this.y - other.y);

		const impactSpeed = Math.max(Math.abs(other.args.xSpeed), 5);
		const impactSign  = Math.sign(other.args.xSpeed);

		if(this.args.hitPoints > 0 && other.controllable)
		{
			if(!(other.args.jumping || other.args.rolling || other.dashed))
			{
				other.damage();

				this.args.phase = 'ready';

				ga('send', 'event', {
					eventCategory: 'boss',
					eventAction: 'damaged-player',
					eventLabel: `${this.viewport.args.actName}::${this.args.id}::${other.args.id}`
				});

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

		if(type === 1 || type === 3) // Side collisions
		{
			if(other.args.falling)
			{
				this.ignores.set(other, 15);
			}
			else
			{
				other.args.gSpeed = 4 * -Math.sign(this.x - other.x);

				if(other.args.rolling)
				{
					this.onNextFrame(() => {
						other.args.gSpeed = -Math.sign(this.x - other.x);
						other.args.rolling = true;
						other.args.direction = Math.sign(other.args.gSpeed);
					});
				}
			}

			this.args.ySpeed = 0;

			if(this.args.hitPoints > 0)
			{
				this.damage(other);
			}

			if(this.args.hitPoints > 0)
			{
				other.args.xSpeed = -xSign * impactSpeed;
				this.args.xSpeed  = xSign * impactSpeed;
			}
			else
			{
				other.args.xSpeed = -xSign;
				this.args.xSpeed  = xSign;
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
				this.args.ySpeed = other.args.ySpeed * 2.5;

				if(other.args.controllable)
				{
					other.args.ySpeed = Math.max(7, Math.abs(other.args.ySpeed));
				}
			}

			this.args.xSpeed = 0;

			if(this.args.hitPoints > 0)
			{
				this.args.phase = 'knocked';
			}

			this.ignores.set(other, 15);
		}

		if(type === 0) // Collide from top
		{
			if(other.args.falling)
			{
				this.ignores.set(other, 15);
			}

			if(other.controllable)
			{
				other.args.y    = this.y - this.args.height;
				const animation = other.args.animation;
				const ySpeed    = other.args.ySpeed;

				this.onNextFrame(() => {
					other.args.ySpeed = -Math.floor(Math.abs(ySpeed)) || -4;
				});
			}

			this.args.xSpeed = 0;

			this.damage(other);
		}

		other.args.ignore = 1;

		if(!this.args.hitPoints)
		{
			other.args.ignore = -2;
		}

		return true;
	}

	damage(other, type = 'normal')
	{
		if(this.args.hitPoints <= 0)
		{
			return;
		}

		const lastHit = this.args.damagers.get(other);

		if(this.args.frameId - lastHit < 5)
		{
			return;
		}

		this.args.hitPoints--;

		this.args.damagers.set(other, this.args.frameId);

		this.args.phase = 'damaged';

		if(this.viewport.args.audio)
		{
			this.hitSound.currentTime = 0;
			this.hitSound.volume = 0.35 + (Math.random() * -0.15);
			this.hitSound.play();
		}
	}

	pointIsSafe(x, y)
	{
		const hazards = this.viewport.actorsAtPoint(x, y).filter(a => a.hazard);

		if(hazards.length)
		{
			return false;
		}

		return true;
	}

	get solid() { return this.args.hitPoints > 0; }
	get rotateLock() { return true; }
}
