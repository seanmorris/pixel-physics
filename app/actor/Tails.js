import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

import { Spring } from './Spring';

import { SkidDust } from '../behavior/SkidDust';
import { Spindash } from '../behavior/Spindash';
import { Crouch }   from '../behavior/Crouch';
import { LookUp }   from '../behavior/LookUp';
import { EmeraldHalo } from '../behavior/EmeraldHalo';
import { SuperForm } from '../behavior/SuperForm';

import { Color } from '../lib/Color';
import { Png } from '../sprite/Png';

export class Tails extends PointActor
{
	png = new Png('/Sonic/tails.png');
	pngTails = new Png('/Sonic/tails-tails.png');

	constructor(...args)
	{
		super(...args);

		this.args.canonical = 'Tails';

		this.behaviors.add(new SkidDust);
		this.behaviors.add(new Spindash);
		this.behaviors.add(new Crouch);
		this.behaviors.add(new LookUp);
		this.behaviors.add(new SuperForm);
		this.behaviors.add(new EmeraldHalo);

		this.args.type      = 'actor-item actor-tails';

		this.accelNormal = 0.15;
		this.accelSuper  = 0.24;

		this.args.accel     = this.accelNormal;
		this.args.decel     = 0.4;

		this.args.flySpeedMax = 25;

		this.gSpeedMaxNormal = 18;
		this.gSpeedMaxSuper  = 20;
		this.gSpeedMaxHyper  = 23;

		this.jumpForceNormal = 11;
		this.jumpForceSuper  = 13;
		this.jumpForceHyper  = 15;

		this.args.maxFlyTimeNormal = 350;
		this.args.maxFlyTimeSuper  = 600;
		this.args.maxFlyTimeHyper  = Infinity;

		this.args.flyBoostNormal = -1.5;
		this.args.flyBoostSuper  = -1.75;
		this.args.flyBoostHyper  = -2.0;

		this.args.flyBoost = this.args.flyBoostNormal;

		this.args.maxFlyTime = this.args.maxFlyTimeNormal;
		this.args.gSpeedMax = this.gSpeedMaxNormal;
		this.args.jumpForce = this.jumpForceNormal;

		this.args.gravity   = 0.5;

		this.args.normalGravity = this.args.gravity;
		this.args.slowGravity = this.args.gravity * 0.125;

		this.args.width  = 16;
		this.args.height = 34;
		this.args.weight = 80;

		this.args.normalHeight  = 32;
		this.args.rollingHeight = 28;;

		this.willStick = false;
		this.stayStuck = false;

		this.flyTime = 0;

		this.sparks = new Set();

		this.spriteSheet = '/Sonic/tails.png';
		this.args.spriteSheet = `url('${this.args.spriteSheet}')`;

		this.spriteSheetTails = '/Sonic/tails-tails.png';
		this.args.spriteSheetTails = `url('${this.spriteSheetTails}')`;

		this.costumes = {
			SkyCamo:  {h: 120, s: 0.8,  v: 1.00},
			Copper:   {h: -45, s: 1.0,  v: 1.00},
			Patina:   {h:  90, s: 0.8,  v: 0.85},
			Arctic:   {h:   0, s: 0.0,  v: 0.85},
		};

		this.args.minRingsSuper = 40;
		this.args.minRingsHyper = 60;

		this.transformTime = 0;
	}

	onRendered(event)
	{
		super.onRendered(event);

		if(this.tails)
		{
			return;
		}

		// this.box = this.findTag('div');
		// this.sprite = this.findTag('div.sprite');

		this.tails = new Tag('<div class = "tails-tails">');
		this.sprite.appendChild(this.tails.node);

		this.flyingSound = new Audio('/Sonic/tails-flying.wav');

		this.flyingSound.volume = 0.35 + (Math.random() * -0.3);
		this.flyingSound.loop   = true;

		this.rotatedSpriteSheet = this.spriteSheet;
		this.rotatedSpriteSheetTails = this.spriteSheetTails;

		this.autoStyle.get(this.box)['--sprite-sheet'] = 'spriteSheet';
		this.autoStyle.get(this.box)['--sprite-sheet-tails'] = 'spriteSheetTails';

		const updateSprite = () => {

			let h = Number(this.viewport.customColor.h ?? 0);
			let s = Number(this.viewport.customColor.s ?? 1);
			let v = Number(this.viewport.customColor.v ?? 1);

			this.rotateMainColor(h,s,v).then(() => {
				this.box.node.style.setProperty('--sprite-sheet', `url(${this.args.rotatedSpriteSheet})`);
				this.box.node.style.setProperty('--sprite-sheet-tails', `url(${this.args.rotatedSpriteSheetTails})`);
			});

		};

		const debindH = this.viewport.customColor.bindTo('h', updateSprite, {wait:0});
		const debindS = this.viewport.customColor.bindTo('s', updateSprite, {wait:0});
		const debindV = this.viewport.customColor.bindTo('v', updateSprite, {wait:0});

		this.onRemove(debindH);
		this.onRemove(debindS);
		this.onRemove(debindV);

		if(this.viewport.args.mainPallet && this.costumes[this.viewport.args.mainPallet])
		{
			Object.assign(this.viewport.customColor, this.costumes[this.viewport.args.mainPallet]);
		}

		this.superSheet = 0;

		const superColorsA = {
			'ffb691': 'efefef',
			'fcb400': 'ebebeb',
			'fc9000': 'd4d4d4',
			'b46c48': 'b8b8b8',
		};

		const superColorsB = {
			'ffb691': 'fff79e',
			'fcb400': 'fefb00',
			'fc9000': 'fef500',
			'b46c48': 'ceae30',
		};

		if(!this.superSpriteSheetLoaders)
		{
			this.superSpriteSheetLoaders = this.png.ready.then(() => this.superSpriteSheets = [
				this.png.recolor(superColorsA).toUrl(),
				this.png.recolor(superColorsB).toUrl(),
			]);

			this.superSpriteSheetTailsLoaders = this.pngTails.ready.then(() => this.superSpriteSheetsTails = [
				this.pngTails.recolor(superColorsA).toUrl(),
				this.pngTails.recolor(superColorsB).toUrl(),
			]);
		}

		this.hyperSheet = 0;

		const hyperColorsRed = {
			'ffb691': 'fcfcfc',
			'fcb400': 'fcfcfc',
			'fc9000': 'fcd8d8',
			'b46c48': 'fcb4b4',
		};

		const hyperColorsPurple = {
			'ffb691': 'fcfcfc',
			'fcb400': 'fcfcfc',
			'fc9000': 'fcd8fc',
			'b46c48': 'd8b4d8',
		};

		const hyperColorsCyan = {
			'ffb691': 'd8fcfc',
			'fcb400': 'fcfcfc',
			'fc9000': 'b4d8fc',
			'b46c48': '90b4fc',
		};

		const hyperColorsBlue = {
			'ffb691': 'd8d8ff',
			'fcb400': 'b4b4d8',
			'fc9000': 'a4a4d8',
			'b46c48': '6c6cb4',
		};

		const hyperColorsGreen = {
			'ffb691': 'd8fcfc',
			'fcb400': 'd8fcd8',
			'fc9000': 'b4fcb4',
			'b46c48': '00fc24',
		};

		const hyperColorsYellow = {
			'ffb691': 'd8fcfc',
			'fcb400': 'd8fcb4',
			'fc9000': 'd8fc48',
			'b46c48': 'd8d800',
		};

		const hyperColorsWhite = {
			'ffb691': 'ffffff',
			'fcb400': 'fcfcfc',
			'fc9000': 'd8d8d8',
			'b46c48': 'b4b4b4',
		};

		if(!this.hyperSpriteSheetLoader)
		{
			this.hyperSpriteSheetLoader = this.png.ready.then(() => this.hyperSpriteSheets = [
				this.png.recolor(hyperColorsRed).toUrl()
				, this.png.recolor(hyperColorsCyan).toUrl()
				, this.png.recolor(hyperColorsPurple).toUrl()
				, this.png.recolor(hyperColorsWhite).toUrl()
				, this.png.recolor(hyperColorsGreen).toUrl()
				, this.png.recolor(hyperColorsBlue).toUrl()
				, this.png.recolor(hyperColorsYellow).toUrl()
			]);

			this.hyperSpriteSheetLoaderTails = this.pngTails.ready.then(() => this.hyperSpriteSheetsTails = [
				this.pngTails.recolor(hyperColorsRed).toUrl()
				, this.pngTails.recolor(hyperColorsCyan).toUrl()
				, this.pngTails.recolor(hyperColorsPurple).toUrl()
				, this.pngTails.recolor(hyperColorsWhite).toUrl()
				, this.pngTails.recolor(hyperColorsGreen).toUrl()
				, this.pngTails.recolor(hyperColorsBlue).toUrl()
				, this.pngTails.recolor(hyperColorsYellow).toUrl()
			]);
		}
	}

	startle()
	{
		super.startle();

		this.args.animation = 'startle';

		this.onNextFrame(() => this.args.animation = 'startle');
	}

	updateStart()
	{
		if(this.args.grinding && this.args.falling && this.args.ySpeed > 0)
		{
			this.args.animation = 'springdash';
			this.args.grinding = false;
		}

		super.updateStart();

		if(this.args.dead)
		{
			this.args.animation = 'dead';
			return;
		}
	}

	update()
	{
		if(this.isSuper)
		{
			if(this.isHyper)
			{
				if(this.viewport.args.frameId % 15 === 0)
				{
					this.hyperSheet++;
					if(this.hyperSheet >= this.hyperSpriteSheets.length)
					{
						this.hyperSheet = 0;
					}
				}

				this.hyperSpriteSheet = this.hyperSpriteSheets[ this.hyperSheet ];
					this.hyperSpriteSheetTails = this.hyperSpriteSheetsTails[ this.hyperSheet ];

				this.args.spriteSheet = `url(${this.hyperSpriteSheet})`;
				this.args.spriteSheetTails = `url(${this.hyperSpriteSheetTails})`;
			}
			else
			{
				if(this.viewport.args.frameId % 15 === 0)
				{
					this.superSheet++;
					if(this.superSheet >= this.superSpriteSheets.length)
					{
						this.superSheet = 0;
					}
				}

				this.superSpriteSheet = this.superSpriteSheets[ this.superSheet ];
					this.superSpriteSheetTails = this.superSpriteSheetsTails[ this.superSheet ];

				this.args.spriteSheet = `url(${this.superSpriteSheet})`;
				this.args.spriteSheetTails = `url(${this.superSpriteSheetTails})`;
			}

			const tick = this.isHyper ? 30 : 60;

			if(this.viewport.args.frameId % tick === 0)
			{
				if(this.args.rings < 2)
				{
					this.isHyper = false;
					this.setProfile();
				}

				if(this.args.rings > 0)
				{
					this.args.rings--;
				}
				else
				{
					this.isSuper = false;
					this.isHyper = false;
					this.setProfile();
				}
			}
		}

		this.args.isSuper = this.isSuper;
		this.args.isHyper = this.isHyper;

		if((!this.args.falling && this.groundTime > 3) || (this.args.falling && this.fallTime > 90))
		{
			this.args.twistRamp = false
		}

		if(this.yAxis === 0)
		{
			this.args.lookTime = 0;
			this.args.cameraBias = 0;
		}

		const falling = this.args.falling;

		if(!this.viewport)
		{
			return;
		}

		if(this.args.bouncing || this.args.wasHanging)
		{
			this.args.flying = false;
			if(this.flyingSound)
			{
				this.flyingSound.pause();
			}
		}

		if(this.args.flying)
		{
			this.args.gravity = this.args.slowGravity;

			this.args.ySpeed = Math.min(3, this.args.ySpeed);
		}
		else
		{
			this.args.gravity = this.args.normalGravity;
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
			// this.flyingSound.pause();
	 		// this.args.flying = false;
		}

		if(!falling)
		{
			this.args.tailFlyCoolDown = 0;

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
				else if(speed > maxSpeed)
				{
					this.args.animation = 'running-2';
				}
				else if(speed > maxSpeed / 2)
				{
					this.args.animation = 'running';
				}
				else if(this.args.moving && this.args.gSpeed)
				{
					this.args.animation = 'walking';
				}
				else if(this.args.teeter)
				{
					this.args.animation = 'teeter';
				}
				else if(this.idleTime > 60)
				{
					this.args.animation = 'idle';
				}
				else
				{
					this.args.animation = 'standing';
				}
			}
		}
		else if(this.args.flying && !this.args.startled)
		{
			if(this.yAxis > 0 && this.args.flying)
			{
				this.flyingSound.pause();
				this.args.animation = 'jumping';

				this.args.float  = 0;
				this.args.flying = false;
				this.args.ySpeed = this.args.ySpeed > this.args.jumpForce
					? this.args.ySpeed
					: this.args.jumpForce;
			}
			else
			{
				if(this.viewport.args.audio)
				{
					this.flyingSound.play();
				}

				this.args.animation = 'flying';

				if(this.flyTime > this.args.maxFlyTime)
				{
					this.args.animation = 'flying-tired';
				}
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
			this.args.flying = false;
			this.flyTime = 0;
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

		if(this.args.flying)
		{
			this.flyTime++;
		}

		if(!this.args.falling)
		{
			this.flyTime = 0;
			this.args.flying = false;
		}
		else
		{
			if(this.args.animation === 'springdash' && this.args.ySpeed >= 0)
			{
				this.args.animation = 'dropping';
			}
		}

		if(this.args.twistRamp)
		{
			this.args.animation = 'side-flip';
		}

		if(!this.args.falling)
		{
			this.dashed = false;
		}
	}

	updateEnd()
	{
		super.updateEnd();
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

		if(this.args.wasHanging)
		{
			return;
		}

		if(!this.args.falling)
		{
			this.args.tailFlyCoolDown = -80;
			return;
		}

		if(this.args.flying && this.args.tailFlyCoolDown === 0)
		{
			this.args.tailFlyCoolDown = 80;
			return;
		}

		if(this.args.flying && (this.flyTime > this.args.maxFlyTime || this.args.float))
		{
			return;
		}

		if(this.args.flying && !this.args.float)
		{
			this.args.ySpeed = this.args.flyBoost;
			this.args.float  = 8;
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
		if(this.args.flying && button.time > 10 && button.time < 30 && this.flyTime < 400)
		{
			this.args.ySpeed *= 0.99;
			this.args.float   = 16;
		}
	}

	sleep()
	{
		this.flyingSound && this.flyingSound.pause();
	}

	collideA(other)
	{
		if(other instanceof Spring)
		{
			this.onNextFrame(()=>{
				if(!this.args.falling)
				{
					return;
				}
				this.springing = true;
				this.args.animation = 'springdash'
			});
		}

		if(other.pop && this.isHyper)
		{
			other.pop(this);
		}
	}

	damage()
	{
		this.args.flying = false;
		this.flyingSound && this.flyingSound.pause();
		super.damage();
	}

	rotateMainColor(rH = 0, rS = 1, rV = 1)
	{
		const rotatedColors = {
			'ffb691': new Color('ffb691').rotate(rH, rS, rV).toString(),
			'fcb400': new Color('fcb400').rotate(rH, rS, rV).toString(),
			'fc9000': new Color('fc9000').rotate(rH, rS, rV).toString(),
			'b46c48': new Color('b46c48').rotate(rH, rS, rV).toString(),
		};

		this.png.ready.then(()=>{
			const newPng = this.png.recolor(rotatedColors);
			this.args.rotatedSpriteSheet = this.rotatedSpriteSheet = this.spriteSheet = newPng.toUrl();
			this.args.spriteSheet = `url(${this.spriteSheet})`;
		});

		this.pngTails.ready.then(()=>{
			const newPng = this.pngTails.recolor(rotatedColors);
			this.args.rotatedSpriteSheetTails = this.rotatedSpriteSheetTails = this.spriteSheetTails = newPng.toUrl();
			this.args.spriteSheetTails = `url(${this.spriteSheetTails})`;
		});

		return Promise.all([this.png.ready, this.pngTails.ready]);
	}

	setProfile()
	{
		if(this.isHyper)
		{
			this.args.spriteSheet = `url('${this.hyperSpriteSheet}')`;
			this.args.spriteSheetTails = `url('${this.hyperSpriteSheetTails}')`;

			this.args.maxFlyTime = this.args.maxFlyTimeHyper;
			this.args.flyBoost = this.args.flyBoostHyper;
			this.args.gSpeedMax = this.gSpeedMaxHyper;
			this.args.jumpForce = this.jumpForceHyper;
			this.args.accel     = this.accelSuper;
		}
		else if(this.isSuper)
		{
			this.args.spriteSheet = `url('${this.superSpriteSheet}')`;
			this.args.spriteSheetTails = `url('${this.superSpriteSheetTails}')`;

			this.args.maxFlyTime = this.args.maxFlyTimeSuper;
			this.args.flyBoost = this.args.flyBoostSuper;
			this.args.gSpeedMax = this.gSpeedMaxSuper;
			this.args.jumpForce = this.jumpForceSuper;
			this.args.accel     = this.accelSuper;
		}
		else
		{
			this.args.spriteSheet = `url('${this.rotatedSpriteSheet}')`;
			this.args.spriteSheetTails = `url('${this.rotatedSpriteSheetTails}')`;

			this.args.maxFlyTime = this.args.maxFlyTimeNormal;
			this.args.flyBoost = this.args.flyBoostNormal;
			this.args.gSpeedMax = this.gSpeedMaxNormal;
			this.args.jumpForce = this.jumpForceNormal;
			this.args.accel     = this.accelNormal;
		}
	}

	command_3()
	{}

	get solid() { return false; }
	get canRoll() { return true; }
	get canFly() { return true; }
	get isEffect() { return false; }
	get controllable() { return !this.args.npc; }
}
