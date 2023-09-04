import { PointActor } from './PointActor';
import { Platformer } from '../behavior/Platformer';
import { Tag } from 'curvature/base/Tag';

import { KnuxBomb } from './KnuxBomb';
import { Spindash } from '../behavior/Spindash';

import { Spring } from './Spring';
import { SkidDust } from '../behavior/SkidDust';
import { Crouch }   from '../behavior/Crouch';
import { LookUp }   from '../behavior/LookUp';
import { EmeraldHalo } from '../behavior/EmeraldHalo';
import { SuperForm } from '../behavior/SuperForm';

import { Color } from '../lib/Color';
import { Png } from '../sprite/Png';

export class Knuckles extends PointActor
{
	png = new Png('/Sonic/knuckles.png');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.canonical = 'Knuckles';

		window.knuckles = this;

		this.behaviors.add(new SkidDust);
		this.behaviors.add(new Spindash);
		this.behaviors.add(new Crouch);
		this.behaviors.add(new LookUp);
		this.behaviors.add(new SuperForm);
		this.behaviors.add(new EmeraldHalo);

		this.args.isHyper = this.args.isSuper = false;

		this.args.type = 'actor-item actor-knuckles';

		this.args.spriteSheet = this.spriteSheet = `url('/Sonic/knuckles.png')`;

		this.gSpeedMaxNormal = 18;
		this.gSpeedMaxSuper  = 20;
		this.gSpeedMaxHyper  = 23;

		this.climbSpeedMaxNormal = 4;
		this.climbSpeedMaxSuper  = 6;

		this.climbSpeedMax = this.climbSpeedMaxNormal;

		this.jumpForceNormal = 9.5;
		this.jumpForceSuper  = 10;
		this.jumpForceHyper  = 11;

		this.accelNormal = 0.15;
		this.accelSuper  = 0.24;

		this.args.accel     = this.accelNormal;
		this.args.decel     = 0.4;

		this.args.gSpeedMax = this.gSpeedMaxNormal;
		this.args.jumpForce = this.jumpForceNormal;
		this.args.gravity   = 0.5;

		this.args.normalGravity = 0.5;
		this.args.slowGravity   = 0.125;

		this.args.punchMomentum = 0;

		this.args.width  = 15;
		this.args.height = 41;
		this.args.weight = 150;

		this.args.normalHeight = 41;
		this.args.rollingHeight = 28;

		this.punchTime = 0;
		this.punched  = 0;

		this.beforePunch = 'standing';

		this.bombsDropped = 0;
		this.args.bellySliding = false;
		this.slideTime = 0;

		this.sparks = new Set();

		this.flyTime = 0;

		this.transformTime = 0;
		this.args.minRingsSuper = 50;
		this.args.minRingsHyper = 75;

		this.args.bindTo('punchMomentum', v => this.args.punchSpeed = Math.abs(v * 0.5));

		this.args.bindTo('falling', v => {

			if(v || !this.args.flying)
			{
				return;
			}

			if(this.args.mode === 1 || this.args.mode === 2 || this.args.mode === 3)
			{
				this.args.climbing = true;

				if(this.isHyper && Math.abs(this.args.xSpeed) > 5)
				{
					this.viewport.args.shakeX = 16;

					if(this.viewport && this.viewport.settings.rumble && this.controller && this.controller.rumble)
					{
						this.controller.rumble({
							duration: 800,
							strongMagnitude: 1.0,
							weakMagnitude: 1.0
						});

						// this.onTimeout(240, () => {
						// 	this.controller.rumble({
						// 		duration: 100,
						// 		strongMagnitude: 0.0,
						// 		weakMagnitude: 0.25
						// 	});
						// });
					}
				}

				this.args.gSpeed = 0;
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
			}
		});

		this.costumes = {
			Tails:   {h: -125, s: 1.0, v: 1.00},
			Enerjak: {h:  120, s: 1.0, v: 0.55},
			Pink:    {h:    0, s: 1.5, v: 1.50},
			Wechnia: {h:   0,  s: 0.0, v: 0.85},
		};
	}

	onRendered(event)
	{
		if(this.box)
		{
			return;
		}

		super.onRendered(event);

		this.autoStyle.get(this.box)['--punchSpeed'] = 'punchSpeed';
		this.autoStyle.get(this.box)['--sprite-sheet'] = 'spriteSheet';

		this.punchAura = new Tag('<div class = "punch-aura">');
		this.punchAura.style({display: 'none'})

		this.sprite.appendChild(this.punchAura.node);

		this.args.bindTo('animation', v => this.box.setAttribute('data-animation', v));

		this.addEventListener('jump', event => {
			if(this.willPunch)
			{
				this.punchTime = this.viewport.args.frameId;
				this.punched++;
			}
		});

		this.rotatedSpriteSheet = this.spriteSheet;

		const updateSprite = () => {

			let h = Number(this.viewport.customColor.h ?? 0);
			let s = Number(this.viewport.customColor.s ?? 1);
			let v = Number(this.viewport.customColor.v ?? 1);

			this.rotateMainColor(h,s,v);

			// this.args.spriteSheet = this.args.rotatedSpriteSheet;

			this.box.node.style.setProperty('--sprite-sheet', `url(${this.args.rotatedSpriteSheet})`);
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
			'f1958e': 'cacaca',
			'd3565c': 'cacaca',
			'c00020': 'b0b0b0',
			'600020': '989898',
			// '900000': '464646',
		};

		const superColorsB = {
			'f1958e': 'faf1f1',
			'd3565c': 'faf1f1',
			'c00020': 'f5dfdf',
			'600020': 'eecaca',
			// '900000': 'f1d5d5',
		};

		if(!this.superSpriteSheetLoaders)
		{
			this.superSpriteSheetLoaders = this.png.ready.then(() => this.superSpriteSheets = [
				this.png.recolor(superColorsA).toUrl(),
				this.png.recolor(superColorsB).toUrl(),
			]);
		}

		this.hyperSheet = 0;

		const hyperColorsRed = {
			'f1958e': 'fcfcfc',
			'd3565c': 'fcfcfc',
			'c00020': 'fcfcfc',
			'600020': 'fcd8d8',
			// '900000': 'fcb4b4',
		};

		const hyperColorsPurple = {
			'f1958e': 'fcfcfc',
			'd3565c': 'fcfcfc',
			'c00020': 'fcfcfc',
			'600020': 'fcd8fc',
			// '900000': 'd8b4d8',
		};

		const hyperColorsCyan = {
			'f1958e': 'd8fcfc',
			'd3565c': 'd8fcfc',
			'c00020': 'fcfcfc',
			'600020': 'b4d8fc',
			// '900000': '90b4fc',
		};

		const hyperColorsBlue = {
			'f1958e': 'd8d8ff',
			'd3565c': 'd8d8ff',
			'c00020': 'b4b4d8',
			'600020': 'a4a4d8',
			// '900000': '6c6cb4',
		};

		const hyperColorsGreen = {
			'f1958e': 'd8fcfc',
			'd3565c': 'd8fcfc',
			'c00020': 'd8fcd8',
			'600020': 'b4fcb4',
			// '900000': '00fc24',
		};

		const hyperColorsYellow = {
			'f1958e': 'd8fcfc',
			'd3565c': 'd8fcfc',
			'c00020': 'd8fcb4',
			'600020': 'd8fc48',
			// '900000': 'd8d800',
		};

		const hyperColorsWhite = {
			'f1958e': 'ffffff',
			'd3565c': 'ffffff',
			'c00020': 'fcfcfc',
			'600020': 'd8d8d8',
			// '900000': 'b4b4b4',
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
				this.args.spriteSheet = `url(${this.hyperSpriteSheet})`;
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
				this.args.spriteSheet = `url(${this.superSpriteSheet})`;
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

		if(this.args.bellySliding)
		{
			this.xAxis = 0;
		}

		if(this.args.wasHanging)
		{
			this.args.flying = false;
		}

		if(this.args.flying)
		{
			const frontUpSolid = this.getMapSolidAt(this.args.x + this.args.xSpeed, this.args.y + -18);
			const frontSolid   = this.getMapSolidAt(this.args.x + this.args.xSpeed, this.args.y);
			const downSolid    = this.getMapSolidAt(this.args.x, this.args.y + 1);

			if(frontSolid && !frontUpSolid && !downSolid)
			while(this.getMapSolidAt(this.args.x + this.args.xSpeed, this.args.y))
			{
				this.args.y--;
			}

			if(this.isHyper && this.yAxis < -0.55)
			{
				this.args.ySpeed -= this.args.slowGravity * 1.1;
			}

			this.args.gravity = this.args.slowGravity;
			this.flyTime++;
		}
		else
		{
			this.args.didBoost = false;
			this.args.gravity  = this.args.normalGravity;
			this.flyTime = 0;
		}

		if(this.args.dead)
		{
			this.punching = false;
		}

		if(this.groundTime === 1 && this.punching)
		{
			this.punching = false;
			this.readyStart(0,1);
		}

		const falling = this.args.falling;

		const wasMoving = this.args.gSpeed;

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!this.args.falling && this.readyTime && this.viewport.args.frameId - this.readyTime > 36)
		{
			this.punched   = false;
			this.readying  = false;
			this.willPunch = false;
			this.punchTime = false;
			this.readyTime = false;
			this.punching = false;

			if(Math.sign(this.args.punchMomentum) === Math.sign(this.xAxis))
			{
				this.args.gSpeed = this.args.punchMomentum;
			}

			this.args.punchMomentum = 0;
		}
		else if(this.readyTime && this.xAxis && Math.abs(this.args.punchMomentum) < 20)
		{
			this.args.punchMomentum += this.xAxis * 0.05;
		}

		if(this.throwing && this.viewport.args.frameId - this.throwing > 20)
		{
			this.throwing = false;
			this.holdBomb = false;

			const bomb = new KnuxBomb({
				x: this.args.x
				, y: this.args.y - 16
				, owner: this
				, xSpeed: this.args.direction * 10 + (-1 + (Math.random() * 2))
				, ySpeed: Math.random() * -2
			});

			this.viewport.spawn.add({object: bomb});
		}

		this.readying = false;

		if(this.punchTime && this.viewport.args.frameId - this.punchTime > 15)
		{
			this.readying = true;
		}

		if(this.punchTime && this.viewport.args.frameId - this.punchTime > 10)
		{
			this.punching = true;
		}

		if(this.punching)
		{
			this.args.rolling = false;
		}

		if(this.punching && Math.abs(this.args.gSpeed) > 10)
		{
			this.auraVisible = true;
			this.viewport.onFrameOut(6, () => {
				this.punchAura.style({display: 'none'})
				this.auraVisible = false;
			});

			this.punchAura.style({display: 'initial'});
		}
		else
		{
			this.auraVisible = false;
			this.punchAura.style({display: 'none'})
		}

		this.stayStuck = false;
		this.willStick = false;

		if(this.args.mercy)
		{
			this.args.flying = false;
		}

		if(this.yAxis === 0)
		{
			this.args.lookTime = 0;
			this.args.cameraBias = 0;
		}

		if(!falling)
		{
			this.bombsDropped = 0;
			this.springing = false;

			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			this.args.knucklesFlyCoolDown = 15;

			this.args.flying = false;

			if(this.args.bellySliding)
			{
				this.args.animation = 'flying';
			}
			else if(!this.args.rolling)
			{
				if(this.args.climbing)
				{
					const climbDir = this.args.mode === 3 ? -1:1;

					if(!this.getMapSolidAt(this.args.x + -climbDir, this.args.y + 1))
					{
						this.args.direction = -climbDir;
						this.args.climbing = false;
						this.args.facing = climbDir > 0 ? 'left' : 'rigjt';
						this.args.animation = 'dropping';
						this.args.x += this.args.width * 0.5 * climbDir;
						this.args.groundAngle = 0;
						this.args.falling = true;
						this.args.ySpeed = this.gSpeedLast * (this.args.mode === 3 ? -1:1);
						this.args.gSpeed = 0;
						this.args.mode = 0;
						return;
					}

					const ledgeDir = this.args.mode === 1 ? -1 : 1;
					const ledgeDist = 16;

					if(this.args.modeTime < 2 || this.yAxis === 0)
					{
						if(!this.climbOverCancel)
						{
							this.args.animation = 'climbing';
							this.args.gSpeed = 0;
						}
					}
					else if(this.yAxis < -0.55)
					{
						if(!this.getMapSolidAt(this.args.x + 18 * ledgeDir, this.args.y - ledgeDist))
						{
							this.args.animation = 'climbing-over';

							if(!this.climbOverCancel)
							{
								this.args.ignore = 12;
								this.args.gSpeed = 0;

								this.climbOverCancel = this.viewport.onFrameOut(12, () =>{
									if(this.args.falling)
									{
										this.climbOverCancel = false;
										return;
									}
									this.args.x += this.args.width * 0.5 * ledgeDir;
									this.args.y -= ledgeDist;
									this.args.direction = ledgeDir;
									this.args.facing = ledgeDir > 0 ? 'right' : 'left';
									this.args.climbing = false;
									this.climbOverCancel = false;
								});
							}
						}
						else
						{
							this.args.animation = 'climbing-up';

							if(Math.abs(this.args.gSpeed) < this.climbSpeedMax)
							{
								const dir = [0,1,0,-1][this.args.mode];
								this.args.direction = dir;
								this.args.gSpeed += -dir;
							}
						}
					}
					else if(this.yAxis > 0.55)
					{
						this.args.animation = 'climbing-down';

						if(Math.abs(this.args.gSpeed) < this.climbSpeedMax)
						{
							this.args.direction = this.args.mode === 1 ? 1 : -1;
							this.args.gSpeed += this.args.direction;
						}

						if(this.getMapSolidAt(this.args.x + 8 * -ledgeDir, this.args.y + 16))
						{
							this.args.x += this.args.width * 0.5 * -ledgeDir;
							this.args.facing = -ledgeDir > 0 ? 'right' : 'left';
							this.args.mode = 0;
							this.args.groundAngle = 0;
							this.args.falling = true;
							this.args.animation = 'standing';
							this.args.y += 8;
						}
					}
				}
				else if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
				{
					this.args.animation = 'skidding';
				}
				else if(this.holdBomb)
				{
					this.args.animation = 'hold-bomb';
				}
				else if(this.throwing)
				{
					this.args.animation = 'throw-bomb';
				}
				else if(this.readying || this.willPunch)
				{
					this.args.animation = 'readying';
				}
				else if(!this.readying && this.punched)
				{
					if(this.punched % 2)
					{
						this.args.animation = 'jabbing';
					}
					else
					{
						this.args.animation = 'punching';
					}
				}
				else if(speed > maxSpeed * 0.75)
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

					if(this.idleTime > 56)
					{
						this.args.animation = 'teeter-2';
					}
				}
				else
				{
					this.args.animation = 'standing';
				}
			}
			else
			{
				this.args.animation = 'rolling';
			}

			if(this.args.grinding)
			{
				this.args.rolling = false;

				this.args.animation = 'grinding';
			}
		}
		else
		{
			this.args.climbing = false;

			if(this.springing)
			{
				this.args.groundAngle = 0;
			}

			if(this.args.flying)
			{
				let inWater = false, topWater = false;

				const topRegions = this.viewport.regionsAtPoint(this.args.x, this.args.y - 36)

				for(const region of this.regions)
				{
					if(region.isWater)
					{
						inWater = true;
					}
				}

				if(Math.abs(this.args.xSpeed) > 6 || Math.abs(this.xAxis) < 0.55 || Math.sign(this.xAxis) === Math.sign(this.args.xSpeed))
				{
					if(inWater)
					{
						this.args.animation = 'swimming';
					}
					else
					{
						this.args.animation = 'flying';
					}
				}
				else if(Math.sign(this.xAxis) !== Math.sign(this.args.xSpeed))
				{
					if(Math.abs(this.args.xSpeed) > 3)
					{
						this.args.animation = 'flying-turning';
					}
					else
					{
						this.args.animation = 'flying-stalled';
					}
				}

				if(this.bMap('checkBelow', this.x, this.y).get(Platformer) && !this.args.climbing)
				{
					// this.args.flying  = false;
					this.args.bellySliding = true;
					this.args.float = 1;
				}

				if(this.yAxis > 0.55)
				{
					this.args.flying = false;
					this.args.ySpeed = 8;
					return;
				}

				if(this.xAxis)
				{
					this.args.flyDirection = Math.sign(this.xAxis);
				}

				this.args.direction = Math.sign(this.args.xSpeed);

				if(this.args.direction < 0)
				{
					this.args.facing = 'left';
				}
				else
				{
					this.args.facing = 'right';
				}

				const maxFlySpeed = (16 + 8 * Math.abs(this.xAxis)) * (inWater ? 0.5 : 1);

				if(this.args.flyDirection)
				{
					if(Math.abs(this.args.xSpeed) < maxFlySpeed)
					{
						if(this.args.flyDirection !== Math.sign(this.args.xSpeed))
						{
							this.args.xSpeed += 0.15625 * Math.sign(this.args.flyDirection) * 4;
						}
						else
						{
							this.args.xSpeed += 0.15625 * Math.sign(this.args.flyDirection);
						}
					}
				}

				if(!this.args.didBoost && Math.abs(this.args.xSpeed) > maxFlySpeed)
				{
					this.args.xSpeed -= 0.1 * (this.args.xSpeed - (maxFlySpeed * Math.sign(this.args.xSpeed)));
				}

				if(this.args.ySpeed > 2 && Math.abs(this.args.xSpeed) < 4)
				{
					this.args.xSpeed += 0.1 * Math.sign(this.args.xSpeed);
				}

				if(inWater && this.args.ySpeed > 1)
				{
					this.args.ySpeed = 1;
				}
				if(!inWater && this.args.ySpeed > 0.5)
				{
					this.args.ySpeed = 0.5;
				}

				this.willStick = true;
				this.stayStuck = true;

				this.args.groundAngle = 0;
			}
			else if(this.args.jumping)
			{
				// if(!this.willPunch && this.punched && this.args.ySpeed > 0)
				// {
				// 	this.args.animation = 'kick';
				// }
				// else

				if((Math.abs(this.args.punchMomentum) > 8 || this.readyTime) && (this.willPunch || this.punching))
				{
					this.args.animation = 'uppercut';

					this.punched++;

					this.punchAura.style({display: 'initial'});
					this.auraVisible = true;

					this.viewport.onFrameOut(15, () => {
						this.punchAura.style({display: 'none'});
						this.auraVisible = false;
					});
				}
				else
				{
					this.punched = false;
					this.punching = false;
					if(!this.args.bellySliding)
					{
						this.args.animation = 'jumping';
					}
				}
			}
		}

		if(this.args.flying)
		{
			this.springing = false;
		}
		else if(this.args.mode % 2 === 0 || this.args.groundAngle)
		{
			this.args.flyDirection = 0;
		}

		if(this.args.knucklesFlyCoolDown > 0)
		{
			this.args.knucklesFlyCoolDown--;
		}

		super.update();

		if(this.willPunch && !wasMoving)
		{
			this.args.gSpeed = 0;
		}

		if(this.args.mode === 0 || this.args.mode === 2)
		{
			if(this.args.climbing && this.args.mode === 2)
			{
				this.args.groundAngle = 0;
				this.args.falling = true;
				this.args.y += this.args.height;
			}

			this.args.climbing = false;
		}

		if(this.args.grinding && !this.args.falling && this.args.gSpeed)
		{
			this.args.bellySliding = false;

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

		if(this.args.grinding)
		{
			this.args.rolling = false;

			this.args.animation = 'grinding';
		}

		if(this.args.falling && this.springing && this.args.ySpeed >= 0)
		{
			this.args.animation = 'dropping';
		}
		else if(this.args.falling && this.springing)
		{
			this.args.animation = 'springdash';
		}

		if(this.args.hangingFrom)
		{
			this.args.animation = 'hanging';
		}

		if(this.args.standingOn && this.args.standingOn.isVehicle)
		{
			this.args.animation = this.args.standingOn.ridingAnimation || 'standing';
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

		if(this.args.dead)
		{
			this.args.animation = 'dead';
		}

		if(this.args.twistRamp)
		{
			this.args.animation = 'side-flip';
		}
	}

	updateEnd()
	{
		if(!this.args.falling && this.punchTime && this.viewport.args.frameId - this.punchTime > (this.willPunch ? 90 : 30))
		{
			this.args.punchMomentum = 0;
			this.punchTime = false;
			this.willPunch = false;
			this.punching  = false;
			this.punched = 0;
		}

		if(!this.args.falling)
		{
			if(this.args.bellySliding)
			{
				this.args.rolling   = false;
				this.args.animation = 'sliding';
				this.alwaysSkidding = true;
				this.slideTime++;
			}
			else
			{
				this.alwaysSkidding = false;
				this.slideTime = 0;
			}

			if(Math.abs(this.args.gSpeed) < 1)
			{
				this.args.bellySliding = false;
			}
		}

		super.updateEnd();

		if(!this.args.falling)
		{
			this.dashed = false;
		}
	}

	startle()
	{
		this.args.climbing = false;
		this.willStick = false;
		this.stayStuck = false;

		super.startle();

		this.onNextFrame(() => this.args.animation = 'startle');
	}

	dropBomb()
	{
		if(this.args.falling)
		{
			this.args.ySpeed = -8;
		}

		const bomb = new KnuxBomb({
			x: this.args.x
			, y: this.args.y - 16
			, owner: this
			, xSpeed: this.args.xSpeed
			, ySpeed: -3
		});;

		this.viewport.spawn.add({object: bomb});
	}

	release_0()
	{
		if(this.args.flying)
		{
			this.args.flying = false;
			this.args.ySpeed *= 0.25;
		}

		// super.release_0();
	}

	command_0()
	{
		this.args.bellySliding = false;

		super.command_0();

		if(this.args.hangingFrom || !this.args.jumping || this.willPunch || !this.args.falling)
		{
			return;
		}

		if(this.args.wasHanging)
		{
			return;
		}

		if(this.args.falling)
		{
			this.args.punchMomentum = 0;
			this.punching = false;
		}

		// if(!this.args.jumpArced)
		// {
		// 	if(this.getMapSolidAt(this.args.x + Math.sign(this.args.direction) * this.args.width * 0.5, this.args.height * 0.5))
		// 	{
		// 		this.args.xSpeed = Math.sign(this.args.direction) * this.args.width * 0.5;
		// 		this.willStick = true;
		// 		this.args.climbing = true;
		// 		return
		// 	}
		// }

		this.args.direction = Math.sign(this.args.xSpeed) || (this.args.facing === 'left' ? -1:1);
		this.args.willJump  = false;
		this.args.flying    = true;
		this.args.xSpeed    = Math.max(4, Math.abs(this.args.xSpeed)) * this.args.direction;
		this.args.ySpeed    = Math.max(0, this.args.ySpeed);
	}

	readyStart(inputDirection = 0, button = 1)
	{
		if(this.readyTime && this.viewport.args.frameId - this.readyTime > 20)
		{
			return;
		}

		this.readyTime = this.viewport.args.frameId;

		if(this.args.flying || this.args.climbing || this.args.falling)
		{
			return;
		}

		this.readyButton = button;

		if(this.punchTime && this.viewport.args.frameId - this.punchTime < 9)
		{
			this.args.punchMomentum = 0;
			// this.args.ignore = 16;
			this.willPunch = false;
			this.punchTime = false;
			this.punched = 0;
			return;
		}

		this.willPunch = true;

		const direction = Math.sign(this.xAxis || inputDirection || this.args.direction);

		this.args.direction = Math.sign(direction || this.args.punchMomentum);

		if(direction < 0)
		{
			this.args.facing = 'left';
		}
		else
		{
			this.args.facing = 'right';
		}

		if(this.punchTime)
		{
			this.args.gSpeed = 0;
			this.punchTime   = false;
			return;
		}

		this.args.punchMomentum = Math.abs(this.args.punchMomentum || this.args.gSpeed || 4) * Math.sign(direction || this.xAxis);
		this.args.gSpeed = 0;
	}

	damage(other,type)
	{
		if(this.readyTime)
		{
			return false;
		}

		super.damage(other,type);
	}

	readyStop(inputDirection, button)
	{
		this.readyTime = false;

		if(this.readyButton !== button)
		{
			return;
		}

		this.readyButton = false;

		if(this.args.flying || this.args.climbing || this.args.falling)
		{
			return;
		}

		if(this.punchTime && this.viewport.args.frameId - this.punchTime < 64)
		{
			this.willPunch = false;
			// this.args.punchMomentum = 0;
			this.punched = 0;
			return;
		}

		this.args.direction = this.args.facing === 'left' ? -1:1;

		const direction = this.args.direction;

		if(!direction || Math.sign(direction) === Math.sign(this.args.punchMomentum))
		{
			this.args.gSpeed = direction
				? (Math.abs(this.args.punchMomentum) * direction)
				: this.args.punchMomentum;
		}
		else if(direction)
		{
			this.args.punchMomentum = Math.abs(this.args.punchMomentum) * direction;

			this.args.gSpeed = 1 * (direction
				? (Math.abs(this.args.punchMomentum) * direction)
				: this.args.punchMomentum
			);
		}

		this.args.direction = Math.sign(direction || this.args.punchMomentum);

		if(direction < 0)
		{
			this.args.facing = 'left';
		}
		else
		{
			this.args.facing = 'right';
		}

		this.punchTime = this.viewport.args.frameId;

		this.willPunch = false;

		if(!this.args.falling && this.args.gSpeed)
		{
			const dustParticle = new Tag(`<div class = "particle-dust">`);

			const dustDist = Math.sign(this.args.gSpeed) * this.dustDist || 0;

			const dustPoint = this.rotatePoint(this.args.gSpeed, 0);

			dustParticle.style({
				'--x': dustPoint[0] + dustDist + this.x
				, '--y': dustPoint[1] + this.y
				, 'z-index': 0
				, opacity: (Math.random() ** 2) * 0.5 + 0.5
			});

			viewport.particles.add(dustParticle);

			viewport.onFrameOut(20, () => {
				viewport.particles.remove(dustParticle);
			});
		}

		if(this.throwing || this.args.climbing)
		{
			return;
		}

		this.punched++;
	}

	command_1()
	{
		if(this.args.climbing)
		{
			this.args.x += this.args.width / 2 * (this.args.mode === 1 ? 1 : -1);
			this.bMap('doJump', 0);
			return;
		}

		if(this.args.falling)
		{
			this.readyStart(0, 1);
			return;
		}

		if(this.cancelReady)
		{
			this.cancelReady();
			this.cancelReady = false;
		}

		this.args.direction = this.args.facing === 'left' ? -1:1;

		this.args.punchMomentum = this.args.punchMomentum || this.args.gSpeed || 3 * (this.args.direction || 1);

		if(!this.args.gSpeed || !this.punched)
		{
			this.readyButton = 1;
			this.punching = true;
			this.readyStop(Math.sign(this.args.punchMomentum), 1);
			this.cancelReady = this.viewport.onFrameOut(20, () => this.readyStart(this.args.direction, 1));
			return;
		}

		if(this.args.gSpeed > 10)
		{
			this.punchAura.style({display: 'initial'});
			this.auraVisible = true;
		}

		this.punched = this.punched || 1;
		this.args.gSpeed = 0;

		this.readyStart(0, 1);
	}

	release_1()
	{
		if(this.args.falling)
		{
			return;
		}

		if(this.willPunch)
		{
			this.readyStop(0,1);
			return;
		}

		if(this.punchTime && this.viewport.args.frameId - this.punchTime < 220)
		{
			return;
		}

		if(this.punchTime && this.viewport.args.frameId - this.punchTime > 320)
		{
			return;
		}

		if(this.args.gSpeed)
		{
			return;
		}

		// this.args.gSpeed = 0;

		if(!this.cancelReady)
		{
			this.cancelReady = this.viewport.onFrameOut(40, () => this.readyStart(this.args.direction, 1));
		}

	}

	command_4()
	{
		this.readyStart(-1, 4);
	}

	release_4()
	{
		this.readyStop(-1, 4);
	}

	command_5()
	{
		this.readyStart(1, 5);
	}

	release_5()
	{
		this.readyStop(1, 5);
	}

	command_2()
	{
		// if(!this.args.ignore && this.args.falling && !this.args.flying && this.bombsDropped < 3)
		// {
		// 	this.dropBomb();

		// 	this.bombsDropped++;

		// 	return;
		// }

		// if(this.args.falling || this.args.climbing)
		// {
		// 	return;
		// }

		// if(Math.abs(this.args.gSpeed) > 3)
		// {
		// 	return;
		// }

		// if(this.punchTime || this.throwing)
		// {
		// 	return;
		// }

		// this.holdBomb = this.viewport.args.frameId;
		// this.args.ignore = -1;
		// this.args.gSpeed = 0;
	}

	release_2()
	{
		if(this.args.falling || this.args.climbing)
		{
			return;
		}

		if(Math.abs(this.args.gSpeed) > 3)
		{
			return;
		}

		if(!this.holdBomb)
		{
			return;
		}

		this.args.ignore = 4;

		this.holdBomb = false;

		this.throwing = this.viewport.args.frameId;
	}

	setCameraMode()
	{
		if(this.args.climbing)
		{
			this.args.cameraMode = 'climbing';
		}
		else
		{
			super.setCameraMode();
		}
	}

	collideA(other)
	{
		if(other instanceof Spring)
		{
			this.onNextFrame(()=>{
				if(!this.args.falling || this.args.hangingFrom)
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

	rotateMainColor(rH = 0, rS = 1, rV = 1)
	{
		const rotatedColors = {
			'f1958e': new Color('f1958e').rotate(rH, rS, rV).toString(),
			'd3565c': new Color('d3565c').rotate(rH, rS, rV).toString(),
			'c00020': new Color('c00020').rotate(rH, rS, rV).toString(),
			// // '900000': new Color('900000').rotate(rH, rS, rV).toString(),
			'600020': new Color('600020').rotate(rH, rS, rV).toString(),
		};

		this.png.ready.then(()=>{
			const newPng = this.png.recolor(rotatedColors);
			this.args.rotatedSpriteSheet = this.rotatedSpriteSheet = this.spriteSheet = newPng.toUrl();
			this.args.spriteSheet = `url('${this.args.rotatedSpriteSheet}')`;
		});
	}

	setProfile()
	{
		if(this.isHyper)
		{
			this.args.spriteSheet = `url('${this.hyperSpriteSheet}')`;

			this.args.gSpeedMax = this.gSpeedMaxHyper;
			this.args.jumpForce = this.jumpForceHyper;
			this.climbSpeedMax  = this.climbSpeedMaxSuper;
			this.args.accel     = this.accelSuper;
		}
		else if(this.isSuper)
		{
			this.args.spriteSheet = `url('${this.superSpriteSheet}')`;

			this.args.gSpeedMax = this.gSpeedMaxSuper;
			this.args.jumpForce = this.jumpForceSuper;
			this.climbSpeedMax  = this.climbSpeedMaxSuper;
			this.args.accel     = this.accelSuper;
		}
		else
		{
			this.args.spriteSheet = `url('${this.rotatedSpriteSheet}')`;

			this.args.gSpeedMax = this.gSpeedMaxNormal;
			this.args.jumpForce = this.jumpForceNormal;
			this.climbSpeedMax  = this.climbSpeedMaxNormal;
			this.args.accel     = this.accelNormal;
		}
	}

	command_3()
	{}

	get solid() { return false; }
	get canRoll() { return !this.args.climbing; }
	get canFly() { return true; }
	get isEffect() { return false; }
	get controllable() { return !this.args.npc; }
}
