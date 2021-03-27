import { Bindable } from 'curvature/base/Bindable';
import { View } from 'curvature/base/View';
import { Tag  } from 'curvature/base/Tag';

import { Twist } from '../effects/Twist';
import { Pinch } from '../effects/Pinch';

import { CharacterString } from '../ui/CharacterString';

import { Classifier } from '../Classifier';

import { Controller } from '../controller/Controller';

import { Sheild }         from '../powerups/Sheild';
import { FireSheild }     from '../powerups/FireSheild';
import { BubbleSheild }   from '../powerups/BubbleSheild';
import { ElectricSheild } from '../powerups/ElectricSheild';

import { LayerSwitch } from './LayerSwitch';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

const WALKING_SPEED  = 100;
const RUNNING_SPEED  = Infinity;
const CRAWLING_SPEED = 1;

const JUMP_FORCE     = 15;

const DEFAULT_GRAVITY = MODE_FLOOR;

export class PointActor extends View
{
	template = `<div
		class  = "point-actor [[type]]"
		style  = "
			display:[[display]];
			--fg-filter:[[fgFilter]];
			--animation-bias:[[animationBias]];
			--bg-filter:[[bgFilter]];
			--sprite-sheet:[[spriteSheet|urlWrap]];
			--angle:[[angle]];
			--fly-angle:[[flyAngle]];
			--ground-angle:[[groundAngle]];
			--air-angle:[[airAngle]];
			--height:[[height]];
			--width:[[width]];
			--x:[[x]];
			--y:[[y]];
		"
		data-camera-mode = "[[cameraMode]]"
		data-colliding   = "[[colliding]]"
		data-falling     = "[[falling]]"
		data-facing      = "[[facing]]"
		data-filter      = "[[filter]]"
		data-angle       = "[[angle|rad2deg]]"
		data-layer       = "[[layer]]"
		data-mode        = "[[mode]]"
	>
		<div class = "sprite" cv-ref = "sprite">
			<div class = "labels" cv-ref = "labels" cv-each = "charStrings:charString:c">[[charString]]</div>
		</div>
	</div>`;

	profiles = {

		normal: {
			height:  1
			, width: 1
			, decel: 0.85
			, accel: 0.2
			, gravity: 0.65
			, airAccel: 0.3
			, jumpForce: 14
			, gSpeedMax: 100
		}

			// , rollSpeedMax = 37;
	};

	static fromDef(objDef)
	{
		const instance = new this();

		const objArgs = {
			x:         objDef.x + 16
			, y:       objDef.y - 1
			, visible: objDef.visible
			, name:    objDef.name
			, id:      objDef.id
		};

		for(const i in objDef.properties)
		{
			const property = objDef.properties[i];

			objArgs[ property.name ] = property.value;
		}

		return new this(Object.assign({}, objArgs));
	}

	constructor(...args)
	{
		super(...args);

		this.region = null;

		this.powerups  = new Set;
		this.behaviors = new Set;
		this.inventory = new Classifier([
			Sheild
			, FireSheild
			, BubbleSheild
			, ElectricSheild
		]);

		this.sheild = null;

		this.inventory.addEventListener('adding', event => {

			const item = event.detail.object;

			this.args.currentSheild = item;

			if(this.inventory.has(item.constructor))
			{
				event.preventDefault();
			}

		});

		this.args.bindTo('currentSheild', v => {

			for(const shield of this.inventory.get(Sheild))
			{
				shield.detach();
			}

			v && v.render(this.sprite);
		});

		Object.defineProperty(this, 'public', {value: {}});

		this.args.bindTo((v,k) => {
			this.public[k] = v;
		});

		this.args.type = 'actor-generic'

		this.args.charStrings = [];

		this.args.display = this.args.display || 'initial';

		this.args.emeralds = 0;
		this.args.rings = 0;
		this.args.coins = 0;

		this.args.yMargin = 0;

		this.args.cameraMode = 'normal';

		this.args.layer = 1;
		this.args.moving = false;

		this.args.flySpeedMax = 40;

		this.args.x = this.args.x || 1024 + 256;
		this.args.y = this.args.y || 32;

		this.args.xOff = 0;
		this.args.yOff = 0;

		this.args.width  = this.args.width  || 1;
		this.args.height = this.args.height || 1;

		this.args.direction = this.args.direction || 1;

		this.args.gSpeed = this.args.gSpeed || 0;
		this.args.xSpeed = this.args.xSpeed || 0;
		this.args.ySpeed = this.args.ySpeed || 0;
		this.args.angle  = this.args.angle  || 0;

		this.args.groundAngle = 0;
		this.args.airAngle    = 0;

		this.lastAngles = [0,0];
		this.angleAvg   = 8;

		this.args.xSpeedMax = 512;
		this.args.ySpeedMax = 512;
		this.args.gSpeedMax    = WALKING_SPEED;
		this.args.rollSpeedMax = 34;
		this.args.gravity   = 0.65;
		this.args.decel     = 0.85;
		this.args.accel     = 0.2;
		this.args.airAccel  = 0.3;
		this.args.jumpForce = 14;

		this.args.jumping  = false;
		this.args.jumpedAt = null;
		this.args.deepJump = false;
		this.args.highJump = false;

		this.maxStep   = 4;
		this.backStep  = 0;
		this.frontStep = 0;

		this.args.rolling = false;

		this.args.skidTraction = 5;
		this.args.skidTraction = 2.25;

		this.args.fgFilter = 'none';
		this.args.bgFilter = 'none';

		this.args.falling  = true;
		this.args.running  = false;
		this.args.crawling = false;
		this.args.climbing = false;

		this.args.rotateFixed = false;

		this.args.mode = DEFAULT_GRAVITY;

		this.xAxis = 0;
		this.yAxis = 0;

		this.willStick = false;
		this.stayStuck = false;

		this.args.ignore = this.args.ignore || 0;
		this.args.float  = this.args.float  || 0;

		this.colliding = false;

		this.args.flyAngle = 0;

		this.args.bindTo('xSpeed', v => this.args.airAngle = Math.atan2(this.args.ySpeed, v));
		this.args.bindTo('ySpeed', v => this.args.airAngle = Math.atan2(v, this.args.xSpeed));

		// this.args.bindTo('gSpeed', v => console.trace(v));
		// this.args.bindTo('falling', v => console.trace(v));

		this.impulseMag = null;
		this.impulseDir = null;

		this.args.stopped   = 0;

		this.args.particleScale = 1;

		this.dropDashCharge = 0;

		const bindable = Bindable.make(this);

		this.debindGroundX = null;
		this.debindGroundY = null;
		this.debindGroundL = null;

		if(this.controllable)
		{
			this.controller = new Controller({deadZone: 0.2});

			this.args.charStrings = [
				new CharacterString({value: this.public.name})
			];

			this.controller.zero();
		}

		bindable.bindTo('region', (region,key,target) => {

			if(region)
			{
				const drag = region.args.drag;

				this.args.xSpeed *= drag;
				this.args.ySpeed *= drag;
				this.args.gSpeed *= drag;
			}

			if(!region)
			{
				region = target[key];
			}

			if(!region)
			{
				return;
			}

			if(this.viewport)
			{
				const viewport = this.viewport;

				if(region.entryParticle)
				{
					const splash   = new Tag(region.entryParticle)

					splash.style({
						'--x': this.x, '--y': region.y - region.args.height
						, 'z-index': 5, opacity: Math.random
						, '--particleScale': this.args.particleScale
					});

					viewport.particles.add(splash);

					setTimeout(() => viewport.particles.remove(splash), 240 * (this.args.particleScale||1));
				}
			}
		});

		this.debindGroundX = new Set;
		this.debindGroundY = new Set;
		this.debindGroundL = new Set;

		this.args.bindTo('standingOn', (groundObject,key,target) => {

			if(this.args.standingOn === groundObject)
			{
				return;
			}

			for(const debind of this.debindGroundX)
			{
				this.debindGroundX.delete(debind);

				debind();
			}

			for(const debind of this.debindGroundY)
			{
				this.debindGroundY.delete(debind);

				debind();
			}

			for(const debind of this.debindGroundL)
			{
				this.debindGroundL.delete(debind);

				debind();
			}

			const prevGroundObject = target[key];

			if(!groundObject)
			{
				if(prevGroundObject && prevGroundObject.isVehicle)
				{
					if(prevGroundObject.occupant === this)
					{
						prevGroundObject.occupant  = null;
						prevGroundObject.stayStuck = false;
						prevGroundObject.willStick = false;
					}

					prevGroundObject.xAxis = 0;
					prevGroundObject.yAxis = 0;
				}

				return;
			}

			if(this.public.jumping && this.controllable && groundObject.isVehicle)
			{
				const debindGroundX = groundObject.args.bindTo('x', (vv,kk) => {
					const x = groundObject.args.direction * groundObject.args.seatForward || 0;
					const y = groundObject.args.seatHeight  || groundObject.args.height || 0;

					const xRot = x * Math.cos(groundObject.realAngle) - y * Math.sin(groundObject.realAngle);
					const yRot = y * Math.cos(groundObject.realAngle) + x * Math.sin(groundObject.realAngle);

					this.args.x = xRot + vv;
					this.args.y = yRot + groundObject.y;
				});

				const debindGroundY = groundObject.args.bindTo('y', (vv,kk) => {
					const x = groundObject.args.direction * groundObject.args.seatForward || 0;
					const y = groundObject.args.seatHeight || groundObject.args.height || 0;

					const xRot = x * Math.cos(groundObject.realAngle) - y * Math.sin(groundObject.realAngle);
					const yRot = y * Math.cos(groundObject.realAngle) + x * Math.sin(groundObject.realAngle);

					this.args.x = xRot + groundObject.x;
					this.args.y = yRot + vv;
				});

				const debindGroundL = groundObject.args.bindTo('layer', (vv,kk) => {
					this.args.layer = vv;
				});

				this.debindGroundX.add(debindGroundX);
				this.debindGroundY.add(debindGroundY);
				this.debindGroundL.add(debindGroundL);

				const occupant = groundObject.occupant;

				groundObject.occupant = this;

				groundObject.args.yMargin = this.args.height;

				if(occupant)
				{
					occupant.args.standingOn = null;

					occupant.args.y -= 32;

					occupant.args.gSpeed = 0;
					occupant.args.xSpeed  = -5 * this.args.direction;
					occupant.args.ySpeed  = -8;
					occupant.args.falling = true;
				}

				this.args.gSpeed = 0;
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
			}
			else if(!groundObject.isVehicle)
			{
				const debindGroundX = groundObject.args.bindTo('x', (vv,kk) => {
					this.args.x += vv - groundObject.args.x
				});

				const debindGroundY = groundObject.args.bindTo('y', (vv,kk) => {
					this.args.y = vv - groundObject.args.height
				});

				const debindGroundL = groundObject.args.bindTo('layer', (vv,kk) => {
					this.args.layer = vv;
				});

				this.debindGroundX.add(debindGroundX);
				this.debindGroundY.add(debindGroundY);
				this.debindGroundL.add(debindGroundL);
			}

			if(prevGroundObject && prevGroundObject.isVehicle)
			{
				if(prevGroundObject.occupant === this)
				{
					prevGroundObject.occupant  = null;
					prevGroundObject.stayStuck = false;
					prevGroundObject.willStick = false;
				}

				prevGroundObject.xAxis = 0;
				prevGroundObject.yAxis = 0;
			}

			groundObject.standBelow(this);
		});

		return bindable;
	}

	onRendered()
	{
		this.box    = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		if(this.controllable)
		{
			this.sprite.parentNode.classList.add('controllable');
		}

		this.listen('click', ()=>{

			if(this.viewport.args.networked)
			{
				return;
			}

			if(!this.controllable)
			{
				return;
			}

			this.viewport.nextControl = Bindable.ref(this);

			for(const option of this.viewport.tags.currentActor.options)
			{
				if(option.value === this.args.name)
				{
					this.viewport.tags.currentActor.value = option.value;
				}
			}

			this.args.ySpeed = 0;
		});
	}

	updateStart()
	{
		this.colliding = false;
		this.restingOn = null;
	}

	updateEnd()
	{}

	update()
	{
		if(this.public.rolling)
		{
			this.args.height = this.public.rollingHeight || this.args.height;
		}
		else if(this.canRoll)
		{
			this.args.height = this.public.normalHeight || this.args.height;
		}

		if(this.args.dontJump > 0)
		{
			this.args.dontJump--;
		}

		if(this.args.dontJump < 0)
		{
			this.args.dontJump = 0;
		}

		if(!this.viewport || this.removed)
		{
			return;
		}

		if(this.args.standingOn && this.args.standingOn.isVehicle && this.args.standingOn.occupant === this)
		{
			const vehicle = this.args.standingOn;

			this.processInput();

			if(this.willJump && this.yAxis >= 0)
			{
				this.willJump = false;

				this.args.standingOn.command_0();
			}

			if(this.willJump && this.yAxis < 0)
			{
				this.willJump   = false;

				this.args.standingOn   = false;
				this.args.falling = true;

				this.args.y -= vehicle.public.seatHeight || vehicle.public.height;

				this.args.ySpeed  = -this.public.jumpForce;
				vehicle.args.ySpeed = 0;
			}

			this.region = this.viewport.regionAtPoint(this.x, this.y);

			return;
		}

		let gSpeedMax = this.public.gSpeedMax;

		if(this.running)
		{
			gSpeedMax = RUNNING_SPEED;
		}
		else if(this.crawling)
		{
			gSpeedMax = CRAWLING_SPEED;
		}

		if(this.impulseMag !== null)
		{
			this.args.xSpeed += Number(Number(Math.cos(this.impulseDir) * this.impulseMag).toFixed(2));
			this.args.ySpeed += Number(Number(Math.sin(this.impulseDir) * this.impulseMag).toFixed(2));

			if(!this.impulseFal)
			{
				switch(this.public.mode)
				{
					case MODE_FLOOR:
						this.args.gSpeed = Math.cos(this.impulseDir) * this.impulseMag;
						this.args.direction = 1;
						break;

					case MODE_CEILING:
						this.args.gSpeed = -Math.cos(this.impulseDir) * this.impulseMag;
						this.args.direction = -1;
						break;

					case MODE_LEFT:
						this.args.gSpeed = -Math.sin(this.impulseDir) * this.impulseMag;
						this.args.direction = 1;
						break;

					case MODE_RIGHT:
						this.args.gSpeed = Math.sin(this.impulseDir) * this.impulseMag;
						this.args.direction = -1;
						break;
				}
			}
			else
			{
				this.args.falling = this.impulseFal;
			}

			this.impulseMag   = null;
			this.impulseDir   = null;
			this.impulseFal   = null;
		}

		if(this.public.ignore === -2 && this.public.falling === false)
		{
			console.log('deignore on land');

			this.public.ignore = 0;
		}

		if(this.public.ignore < 1 && this.public.ignore > 0)
		{
			this.args.ignore = 0;
		}

		if(this.public.ignore > 0)
		{
			this.args.ignore--;
		}

		if(this.public.float > 0)
		{
			this.args.float--;
		}

		if(this.args.falling)
		{
			this.args.standingOn  = null;
			this.args.landed = false;
			this.lastAngles  = [];

			if(this.public.jumping && this.public.jumpedAt < this.y)
			{
				this.args.deepJump = true;
			}
			else if(this.public.jumping && this.public.jumpedAt > this.y + 160)
			{
				this.args.highJump = true;
			}
			else
			{
				this.args.deepJump = false;
			}
		}
		else
		{
			if(this.public.jumping)
			{
				this.args.jumping  = false;
				this.args.deepJump = false;
				this.args.highJump = false;
				this.args.jumpedAt = null;
				this.args.dontJump = 5;
			}
		}

		this.region = this.viewport.regionAtPoint(this.x, this.y);

		if(!this.isEffect && this.public.falling && this.viewport)
		{
			this.updateAirPosition();
		}
		else if(!this.isEffect && !this.public.falling)
		{
			this.updateGroundPosition();

			this.args.animationBias = Math.abs(this.args.gSpeed / this.args.gSpeedMax).toFixed(1);

			if(this.args.animationBias > 1)
			{
				this.args.animationBias = 1;
			}
		}

		if(this.viewport && !(this instanceof LayerSwitch))
		{
			this.viewport.actorsAtPoint(this.x, this.y, this.public.width, this.public.height)
				.filter(x => x.args !== this.args)
				.filter(x => !(x instanceof LayerSwitch || x.isPushable))
				.filter(x => x.callCollideHandler(this));
		}


		if(!this.viewport || this.removed)
		{
			return;
		}

		const tileMap = this.viewport.tileMap;

		if(this.public.gSpeed === 0 && !this.public.falling && this.public.dontJump === 0)
		{
			if(!this.stayStuck && !this.public.climbing)
			{
				const half = Math.floor(this.public.width / 2) || 0;

				if(!tileMap.getSolid(this.x, this.y+1, this.public.layer))
				{
					const mode = this.args.mode;

					this.lastAngles = [];

					if(mode !== MODE_FLOOR)
					{
						if(mode === MODE_LEFT && this.public.groundAngle <= 0)
						{
							this.doJump(1);

							this.args.x += Math.floor(this.public.width / 2);
							this.args.facing    = 'right'
							this.args.direction = 1;
						}
						else if(mode === MODE_RIGHT && this.public.groundAngle >= 0)
						{
							this.doJump(1);

							this.args.x -= Math.floor(this.public.width / 2);
							this.args.facing    = 'left'
							this.args.direction = -1;
						}
						else if(mode === MODE_CEILING)
						{
							this.args.y += Math.floor(this.public.height);

							if(this.public.direction == -1)
							{
								this.args.direction = 1;
								this.args.facing    = 'right'
							}
							else
							{
								this.args.direction = -1;
								this.args.facing    = 'left'
							}

							this.doJump(0.5);
						}
					}
				}
			}
		}

		this.args.landed = true;

		this.args.x = Math.floor(this.public.x);
		this.args.y = Math.floor(this.public.y);

		if(this.public.falling && !this.isEffect)
		{
			this.resolveIntersection();
		}

		if(this.public.falling && this.public.ySpeed < this.public.ySpeedMax)
		{
			if(!this.public.float)
			{
				this.args.ySpeed += this.public.gravity * (this.region ? this.region.public.gravity : 1);
			}

			this.args.landed = false;
		}

		this.processInput();

		if(this.public.falling || this.public.gSpeed)
		{
			this.args.stopped = 0;
		}
		else
		{
			this.args.stopped++;
		}

		if(!this.public.falling && !this.public.float)
		{
			if(this.lastAngles.length > 0)
			{
				this.args.groundAngle = this.lastAngles.map(a=>Number(a)).reduce(((a,b)=>a+b)) / this.lastAngles.length;
			}

			if(isNaN(this.public.groundAngle))
			{
				console.log(this.lastAngles, this.lastAngles.length);
			}

			const standingOn = this.getMapSolidAt(...this.groundPoint);

			const half = Math.floor(this.args.width / 2);

			if(Array.isArray(standingOn) && standingOn.length)
			{
				const groundActors = standingOn.filter(
					a => a.args !== this.args && a.solid
				);

				this.args.standingOn = groundActors[0];

				this.args.groundAngle = 0;

			}
			else if(standingOn)
			{
				this.args.standingOn = null;
			}
			else
			{
				if(half)
				{
					const leftGroundPoint  = [...this.groundPoint];

					leftGroundPoint[0] -= half;

					const standingOnLeft = this.getMapSolidAt(leftGroundPoint[0], leftGroundPoint[1]);

					if(Array.isArray(standingOnLeft) && standingOnLeft.length)
					{
						const groundActors = standingOnLeft.filter(
							a => a.args !== this.args && a.solid
						);

						this.args.standingOn = groundActors[0];

					}
					else if(standingOnLeft)
					{
						this.args.standingOn = null;
					}
					else
					{
						const rightGroundPoint = [...this.groundPoint];

						rightGroundPoint[0] += half;

						const standingOnRight = this.getMapSolidAt(rightGroundPoint[0], rightGroundPoint[1]);

						if(Array.isArray(standingOnRight) && standingOnRight.length)
						{
							const groundActors = standingOnRight.filter(
								a => a.args !== this.args && a.solid
							);

							this.args.standingOn = groundActors[0];

						}
						else if(standingOnRight)
						{
							this.args.standingOn = null;
						}
						else
						{
							this.args.standingOn = null;
							this.args.falling = true;
						}
					}
				}
				else
				{
					this.args.standingOn = null;
					this.args.falling = true;
				}
			}
		}
		else
		{
			this.args.standingOn = null;
		}

		if(this.args.standingOn && this.args.standingOn.isVehicle)
		{
			this.args.cameraMode = this.args.standingOn.public.cameraMode;
		}
		else
		{
			if(this.getMapSolidAt(this.x, this.y + 48, false))
			{
				this.args.cameraMode = 'normal';
			}
			else if(this.public.falling && !this.getMapSolidAt(this.x, this.y + 48, false))
			{
				this.onTimeout(750, () => {

					if(this.args.cameraMode === 'airplane')
					{
						return;
					}

					if(this.public.falling && !this.getMapSolidAt(this.x, this.y + 48, false))
					{
						this.args.cameraMode = 'aerial';
					}
				});
			}
		}

		this.args.colliding = this.colliding;

		for(const behavior of this.behaviors)
		{
			behavior.update(this);
		}

		if(this.twister)
		{
			this.twister.args.x = this.public.x;
			this.twister.args.y = this.public.y;

			this.twister.args.xOff = this.public.xOff;
			this.twister.args.yOff = this.public.yOff;

			this.twister.args.width  = this.public.width;
			this.twister.args.height = this.public.height;
		}

		if(this.pincherBg)
		{
			this.pincherBg.args.x = this.public.x;
			this.pincherBg.args.y = this.public.y;

			this.pincherBg.args.xOff = this.public.xOff;
			this.pincherBg.args.yOff = this.public.yOff;

			this.pincherBg.args.width  = this.public.width;
			this.pincherBg.args.height = this.public.height;
		}

		if(this.pincherFg)
		{
			this.pincherFg.args.x = this.public.x;
			this.pincherFg.args.y = this.public.y;

			this.pincherFg.args.xOff = this.public.xOff;
			this.pincherFg.args.yOff = this.public.yOff;

			this.pincherFg.args.width  = this.public.width;
			this.pincherFg.args.height = this.public.height;
		}
	}

	updateGroundPosition()
	{
		const drag = this.region ? this.region.public.drag : 1;

		if(!this.public.dontJump && this.willJump)
		{
			this.willJump = false;

			let force = this.args.jumpForce * drag;

			if(this.running)
			{
				force = force * 1.5;
			}
			else if(this.crawling)
			{
				force = force * 0.5;
			}

			this.doJump(force);

			return;
		}

		let gSpeedMax = this.args.gSpeedMax;

		if(this.running)
		{
			gSpeedMax = RUNNING_SPEED;
		}
		else if(this.crawling)
		{
			gSpeedMax = CRAWLING_SPEED;
		}

		let nextPosition = [0, 0];

		if(this.public.gSpeed)
		{
			const radius   = Math.floor(this.public.width / 2);
			const scanDist = radius + Math.abs(this.public.gSpeed);

			const direction = Math.sign(this.public.gSpeed || this.public.direction);

			const max  = Math.abs(this.public.gSpeed);
			const step = 1;

			this.pause(true);

			for(let s = 0; s < max; s += step)
			{
				nextPosition = this.findNextStep(step * direction);

				if(!nextPosition)
				{
					break;
				}

				if(this.public.width > 1)
				{
					if(this.public.rolling)
					{
						const scanForwardHead = this.scanForward(step * direction, 1);

						if(scanForwardHead !== false)
						{
							this.args.gSpeed = scanForwardHead;

							break;
						}
					}
					else
					{
						const scanForwardWaist = this.scanForward(step * direction, 0.5);

						if(scanForwardWaist !== false)
						{
							this.args.gSpeed = scanForwardWaist;

							break;
						}
					}
				}

				if(nextPosition[3])
				{
					this.args.moving = false;
					this.args.gSpeed = 0;

					if(this.public.mode === MODE_LEFT || this.public.mode === MODE_RIGHT)
					{
						this.args.mode = MODE_FLOOR;
						this.lastAngles = [];
					}

					break;
				}
				else if(nextPosition[2] === true)
				{
					this.args.moving = true;
					nextPosition[0] = step;
					nextPosition[1] = 0;

					this.args.ySpeed  = 0;

					switch(this.public.mode)
					{
						case MODE_FLOOR:
							this.args.xSpeed  = this.public.gSpeed;
							this.args.x      += this.public.direction;
							this.args.falling = !!this.public.gSpeed;
							this.args.float   = this.args.float < 0 ? this.args.float : 1;
							break;

						case MODE_CEILING:
							this.args.xSpeed = -this.public.gSpeed;
							this.args.falling = !!this.public.gSpeed;
							this.args.float = this.args.float < 0 ? this.args.float : 1;
							break;

						case MODE_LEFT:
							if(Math.abs(this.public.gSpeed) < 8)
							{
								this.args.mode = MODE_FLOOR;
								this.args.y--;
								this.args.x += this.public.direction * this.public.width / 2;
							}
							else
							{
								this.args.ySpeed = this.public.gSpeed;
								this.args.xSpeed = 0;
								this.args.ignore = 8;
								this.args.falling = true;
							}
							break;

						case MODE_RIGHT:
							if(Math.abs(this.public.gSpeed) < 8)
							{
								this.args.mode = MODE_FLOOR;
								this.args.y--;
								this.args.x += this.public.direction * this.public.width / 2;
							}
							else
							{
								this.args.ySpeed = -this.public.gSpeed;
								this.args.xSpeed = 0;
								this.args.ignore = 8;
								this.args.falling = true;
							}
							break;
					}

					this.args.gSpeed = 0;

					break;
				}
				else if(!nextPosition[0] && !nextPosition[1])
				{
					this.args.moving = false;

					switch(this.public.mode)
					{
						case MODE_FLOOR:
						case MODE_CEILING:
							this.args.gSpeed = 0;
							break;

						case MODE_LEFT:
						case MODE_RIGHT:

							break;
					}
				}
				else if((nextPosition[0] || nextPosition[1]) && !this.rotateLock)
				{
					this.args.moving = true;

					this.args.angle = nextPosition[0]
						? (Math.atan(nextPosition[1] / nextPosition[0]))
						: (nextPosition[1] > 0 ? Math.PI / 2 : -Math.PI / 2);

					this.lastAngles.unshift(this.public.angle);

					this.lastAngles.splice(this.angleAvg);
				}

				if(!this.rotateLock)
				{
					switch(this.public.mode)
					{
						case MODE_FLOOR:
							this.args.x += nextPosition[0];
							this.args.y -= nextPosition[1];
							break;

						case MODE_CEILING:
							this.args.x -= nextPosition[0];
							this.args.y += nextPosition[1];
							break;

						case MODE_LEFT:
							this.args.x += nextPosition[1];
							this.args.y += nextPosition[0];
							break;

						case MODE_RIGHT:
							this.args.x -= nextPosition[1];
							this.args.y -= nextPosition[0];
							break;
					}

					if(this.public.angle > Math.PI / 4 && this.public.angle < Math.PI / 2)
					{
						this.lastAngles = this.lastAngles.map(n => n - Math.PI / 2);

						switch(this.args.mode)
						{
							case MODE_FLOOR:
								this.args.mode = MODE_RIGHT;
								break;

							case MODE_RIGHT:
								this.args.mode = MODE_CEILING;
								break;

							case MODE_CEILING:
								this.args.mode = MODE_LEFT;
								break;

							case MODE_LEFT:
								this.args.mode = MODE_FLOOR;
								break;
						}

						this.args.groundAngle -= Math.PI / 2;
					}
					else if(this.public.angle < -Math.PI / 4 && this.public.angle > -Math.PI / 2)
					{
						const orig = this.args.mode;

						this.lastAngles = this.lastAngles.map(n => Number(n) + Math.PI / 2);

						switch(this.args.mode)
						{
							case MODE_FLOOR:
								this.args.mode = MODE_LEFT;
								break;

							case MODE_RIGHT:
								this.args.mode = MODE_FLOOR;
								break;

							case MODE_CEILING:
								this.args.mode = MODE_RIGHT;
								break;

							case MODE_LEFT:
								this.args.mode = MODE_CEILING;
								break;
						}

						this.args.groundAngle = Number(this.args.groundAngle) + Math.PI / 2;
					}
				}
			}

			this.pause(false);

			let slopeFactor = 0;

			if(!this.args.climbing)
			{
				switch(this.args.mode)
				{
					case MODE_FLOOR:

						slopeFactor = this.public.groundAngle / (Math.PI/4);

						if(direction > 0)
						{
							slopeFactor *= -1;
						}
						break;

					case MODE_CEILING:

						slopeFactor = 0;

						break;

					case MODE_RIGHT:

						if(direction > 0)
						{
							slopeFactor = -2;

							slopeFactor -= this.public.groundAngle / (Math.PI/4);
						}
						else
						{
							slopeFactor = 2;

							slopeFactor += this.public.groundAngle / (Math.PI/4) ;
						}
						break;

					case MODE_LEFT:

						if(direction > 0)
						{
							slopeFactor = 2;

							slopeFactor -= this.public.groundAngle / (Math.PI/4);
						}
						else
						{
							slopeFactor = -2;

							slopeFactor += this.public.groundAngle / (Math.PI/4) ;
						}

						break;
				}

				if(this.public.rolling)
				{
					if(slopeFactor < 0)
					{
						this.args.gSpeed *= 1.0000 - (0-(slopeFactor/2) * 0.005);
					}
					else if(slopeFactor > 0)
					{
						this.args.gSpeed *= 1.0000 * (1+(slopeFactor/2) * 0.035);
					}

					if(Math.sign(this.public.gSpeed) !== Math.sign(this.xAxis) && Math.abs(this.public.gSpeed) < 1)
					{
						// this.public.gSpeed = 10 * Math.sign(this.xAxis);
					}
				}
				else if(!this.stayStuck)
				{
					let speedFactor = 1;

					if(slopeFactor < 0 && Math.abs(this.public.gSpeed) < 10)
					{
						speedFactor = 0.99990 * (1 - (slopeFactor**2/4) / 2);
					}
					else if(slopeFactor > 0 && Math.abs(this.public.gSpeed) < this.public.gSpeedMax / 2)
					{
						speedFactor = 1.05000 * (1 + (slopeFactor**2/4) / 2);
					}

					this.args.gSpeed *= speedFactor;

					if(Math.abs(this.public.gSpeed) < 1)
					{
						if(slopeFactor < -1)
						{
							this.args.gSpeed *= -0.5;
							this.args.ignore = 8;
							this.xAxis = 0;
						}
					}
				}

				if(!this.stayStuck && slopeFactor < -1 && Math.abs(this.args.gSpeed) < 1)
				{
					if(this.args.mode === 1)
					{
						this.args.gSpeed = 1;
					}
					else if(this.args.mode === 3)
					{
						this.args.gSpeed = -1;
					}
				}
			}

			if(!this.xAxis && this.public.gSpeed > 0)
			{
				if(this.public.rolling)
				{
					this.args.gSpeed -= this.public.decel * 1/drag * 0.125;
				}
				else
				{
					this.args.gSpeed -= this.public.decel * 1/drag
				}
			}
			else if(!this.xAxis && this.public.gSpeed < 0)
			{
				if(this.public.rolling)
				{
					this.args.gSpeed += this.public.decel * 1/drag * 0.125;
				}
				else
				{
					this.args.gSpeed += this.public.decel * 1/drag
				}
			}

			if(!this.xAxis && Math.abs(this.public.gSpeed) < this.public.decel * 1/drag)
			{
				this.args.gSpeed = 0;
			}
		}

		if(nextPosition && (nextPosition[0] !== false || nextPosition[1] !== false))
		{
			if(Math.abs(this.public.gSpeed) > this.public.rollSpeedMax
				&& this.public.rollSpeedMax !== Infinity
				&& this.public.rollSpeedMax !== -Infinity
			){
				this.args.gSpeed = this.public.rollSpeedMax * Math.sign(this.public.gSpeed);
			}
		}
		else
		{
			this.args.ignore = this.public.ignore || 1;

			this.args.gSpeed = 0;
		}
	}

	updateAirPosition()
	{
		let lastPoint = [this.x, this.y];
		let lastPointB = [this.x, this.y];
		let lastForePoint = [this.x, this.y];

		this.lastAngles.splice(0);
		this.args.groundAngle = 0;

		const tileMap   = this.viewport.tileMap;
		const cSquared  = this.public.xSpeed**2 + this.public.ySpeed**2;
		const airSpeed  = cSquared ? Math.sqrt(cSquared) : 0;
		const viewport  = this.viewport;
		const radius    = Math.round(this.public.width / 2);
		const direction = Math.sign(this.public.xSpeed);

		// this.args.direction = direction;

		if(!airSpeed)
		{
			return;
		}

		if(!this.willStick && this.args.xSpeed)
		{
			const foreDistance = this.scanForward(this.public.xSpeed, 0.5);

			if(foreDistance !== false)
			{
				this.args.x += foreDistance * Math.sign(this.public.xSpeed);
				this.args.flySpeed = 0;
				this.args.xSpeed   = 0;

				if(!this.args.flying && !this.args.float)
				{
					// this.args.ignore = -2;
				}
			}
		}

		if(this.public.xSpeed)
		{
			const backDistance = this.castRay(
				radius
				, Math.PI
				, (i, point) => {
					if(tileMap.getSolid(...point, this.public.layer))
					{
						return i;
					}
				}
			);

			const foreDistance = this.castRay(
				radius
				, 0
				, (i, point) => {
					if(tileMap.getSolid(...point, this.public.layer))
					{
						return i;
					}
				}
			);

			if(backDistance && foreDistance)
			{
				// crush instakill?
			}
			else if(foreDistance)
			{
				this.args.x -= 0 + (radius - foreDistance);
			}
			else if(backDistance)
			{
				this.args.x += 0 + (radius - backDistance);
			}
		}

		const airPoint = this.castRay(
			airSpeed + radius
			, this.public.airAngle
			, (i, point) => {
				const actors = viewport.actorsAtPoint(point[0], point[1])
					.filter(x => x.args !== this.args)
					.filter(x => x.callCollideHandler(this))
					.filter(x => x.solid);

				if(actors.length > 0)
				{
					return point;
				}

				if(tileMap.getSolid(point[0], point[1], this.public.layer))
				{
					return lastPoint;
				}

				lastPoint = point.map(Math.floor);
			}
		);

		const airPointB = this.castRay(
			airSpeed + radius
			, this.public.airAngle
			, [0, -3]
			, (i, point) => {
				const actors = viewport.actorsAtPoint(point[0], point[1])
					.filter(x => x.args !== this.args)
					.filter(x => x.callCollideHandler(this))
					.filter(x => x.solid);

				if(actors.length > 0)
				{
					return point;
				}

				if(tileMap.getSolid(point[0], point[1], this.public.layer))
				{
					return lastPointB;
				}

				lastPointB = point.map(Math.floor);
			}
		);

		this.willJump = false;

		let blockers = false;

		const upMargin = (this.public.flying
			? (this.public.height + this.public.yMargin)
			: this.public.height) || 1;

		const upDistance = this.castRay(
			Math.abs(this.public.ySpeed) + upMargin + 1
			, this.upAngle
			, (i, point) => {

				if(!this.viewport)
				{
					return false;
				}

				const actors = this.viewport.actorsAtPoint(point[0], point[1])
					.filter(x => x.args !== this.args)
					.filter(x => x.callCollideHandler(this))
					.filter(a => a.solid);

				if(actors.length > 0)
				{
					return i;
				}

				if(tileMap.getSolid(point[0], point[1], this.args.layer))
				{
					return i;
				}
			}
		);

		const xSpeedOriginal = this.public.xSpeed;
		const ySpeedOriginal = this.public.ySpeed;

		if(this.public.ySpeed < 0 && upDistance !== false)
		{
			this.args.ignore = 1;

			this.args.y -= (Math.floor(upDistance - (upMargin)));
			this.args.ySpeed = 0;

			blockers = this.getMapSolidAt(this.x, this.y);

			if(Array.isArray(blockers) && !this.public.flying)
			{
				const stickers = blockers.filter(a => a.canStick);

				if(this.willStick && stickers.length)
				{
					this.args.gSpeed = Math.floor(-xSpeedOriginal);
					this.args.mode = MODE_CEILING;
					this.args.falling = false;
				}
			}
			else if(this.willStick && !this.public.flying)
			{
				const blockers = this.getMapSolidAt(this.x, this.y-1);
				const stickers = Array.isArray(blockers) && blockers.filter(a=>a.canStick);

				if(!blockers.length || (blockers.length && stickers.length))
				{
					this.args.gSpeed = Math.floor(-xSpeedOriginal);
					this.args.mode = MODE_CEILING;
					this.args.falling = false;
				}
			}
		}
		else if(airPoint !== false && airPointB !== false)
		{
			const collisionAngle = Math.atan2(airPoint[0] - airPointB[0], airPoint[1] - airPointB[1]);

			const isLeft    = Math.abs(collisionAngle) < Math.PI / 2 && this.public.xSpeed < 0;
			const isRight   = Math.abs(collisionAngle) < Math.PI / 2 && this.public.xSpeed > 0;

			// this.args.ignore = 0;

			const xSpeedOriginal = this.args.xSpeed;
			const ySpeedOriginal = this.args.ySpeed;

			this.args.gSpeed = xSpeedOriginal || this.args.gSpeed;
			this.args.xSpeed = 0;
			this.args.ySpeed = 0;

			const stickX = this.args.x = Math.floor(airPoint[0]);
			const stickY = this.args.y = Math.floor(airPoint[1]);

			blockers = this.getMapSolidAt(this.x + direction, this.y);

			if(Array.isArray(blockers))
			{
				blockers = blockers.filter(a => a.callCollideHandler(this));

				if(!blockers.length)
				{
					blockers = false;
				}
			}

			if(
				this.willStick
				&& !this.getMapSolidAt(this.x - direction, this.y)
				&& !this.getMapSolidAt(this.x, this.y + 1)
			){
				if(isLeft)
				{
					this.args.gSpeed = Math.floor(airSpeed) * Math.sign(ySpeedOriginal);
					this.args.gSpeed = 0.1;
					this.args.mode   = MODE_LEFT;
				}
				else if(isRight)
				{
					this.args.gSpeed = Math.floor(airSpeed) * -Math.sign(ySpeedOriginal);
					this.args.gSpeed = 0.1;
					this.args.mode   = MODE_RIGHT;
				}
				else
				{
					this.args.mode = MODE_FLOOR;
				}
			}

			const halfWidth    = Math.floor(this.public.width / 2);

			const backPosition = this.findNextStep(-halfWidth);
			const forePosition = this.findNextStep(halfWidth);
			const sensorSpread = this.public.width;

			if(forePosition && backPosition)
			{
				const newAngle = Math.atan2(forePosition[1] - backPosition[1], sensorSpread+1).toFixed(1);

				if(isNaN(newAngle))
				{
					console.log(newAngle);

					throw new Error('angle is NAN!');
				}

				if(forePosition[0] !== false || backPosition[0] !== false)
				{
					this.args.angle = this.args.groundAngle = newAngle;

					this.lastAngles.unshift(newAngle);
					this.lastAngles.splice(this.angleAvg);

					const slopeDir = -Math.sign(this.args.groundAngle);

					if(Math.abs(slopeDir) > 0)
					{
						this.args.gSpeed = ySpeedOriginal * slopeDir;
					}
					else if(xSpeedOriginal)
					{
						this.args.gSpeed = xSpeedOriginal;
					}
				}

				if(Math.abs(this.args.gSpeed) < 1)
				{
					this.args.gSpeed = Math.sign(this.args.gSpeed);
				}
			}

			this.args.falling = false;

			if(this.dropDashCharge && this.args.mode === MODE_FLOOR)
			{
				const dropBoost = this.dropDashCharge * Math.sign(this.public.xSpeed || this.public.direction);

				this.args.gSpeed += dropBoost;

				const viewport = this.viewport;

				const dustParticle = new Tag('<div class = "particle-dust">');

				const dustPoint = this.rotatePoint(this.args.gSpeed, 0);

				dustParticle.style({
					'--x': dustPoint[0] + this.x
					, '--y': dustPoint[1] + this.y
					, 'z-index': 0
					, opacity: Math.random() * 2
				});

				viewport.particles.add(dustParticle);

				setTimeout(() => {
					viewport.particles.remove(dustParticle);
				}, 350);
			}

			if(this.yAxis > 0 && this.canRoll && this.public.gSpeed)
			{
				this.args.rolling = true;
			}
		}
		else if(this.public.ySpeed > 0)
		{
			this.args.mode = DEFAULT_GRAVITY;

			this.args.gSpeed = Math.floor(xSpeedOriginal);
		}

		if(Math.abs(this.public.xSpeed) > this.public.xSpeedMax)
		{
			this.args.xSpeed = this.public.xSpeedMax * Math.sign(this.public.xSpeed);
		}

		if(Math.abs(this.public.ySpeed) > this.public.ySpeedMax)
		{
			this.args.ySpeed = this.public.ySpeedMax * Math.sign(this.public.ySpeed);
		}

		if(airPoint === false)
		{
			this.args.x += this.public.xSpeed;
			this.args.y += this.public.ySpeed;

			this.args.falling = true;
		}
	}

	callCollideHandler(other)
	{
		if(this.isGhost)
		{
			return;
		}

		this.colliding = true;

		let type;

		this.args.collType = 'collision-intersect';

		type = -1;

		if(other.y <= this.y - this.args.height)
		{
			this.args.collType = 'collision-top';

			type = 0;
		}
		else if(other.x < this.x - Math.floor(this.args.width/2))
		{
			this.args.collType = 'collision-left';

			type = 1;
		}
		else if(other.x >= this.x + Math.floor(this.args.width/2))
		{
			this.args.collType = 'collision-right';

			type = 3;
		}
		else if(other.y >= this.y)
		{
			this.args.collType = 'collision-bottom';

			type = 2;
		}

		if(this.viewport)
		{
			const collisionListA = this.viewport.collisions.get(this)  || new Set;
			const collisionListB = this.viewport.collisions.get(other) || new Set;

			collisionListA.add(other);
			collisionListB.add(this);

			this.viewport.collisions.set(this,  collisionListA);
			this.viewport.collisions.set(other, collisionListB);
		}

		this.collideB(other, type);
		other.collideB(this);

		return this.collideA(other, type) || other.collideA(this);
	}

	resolveIntersection()
	{
		if(!this.args.falling || this.public.jumping)
		{
			return;
		}

		let backAngle = this.args.airAngle + Math.PI;

		let iterations = 0;

		if(this.getMapSolidAt(this.x, this.y))
		{
			let testX = this.x;
			let testY = this.y;

			this.args.ignore = 10;

			let blockers, b;

			const maxIterations = this.public.height > this.public.width
				? this.public.height
				: this.public.witdth;

			while(true)
			{
				if(!this.viewport)
				{
					return;
				}

				b = this.getMapSolidAt(testX, testY);

				if(!b)
				{
					break;
				}

				blockers = b;

				if(Array.isArray(blockers))
				{
					blockers = blockers.filter(x=>x.args!==this.args).filter(x=>x.callCollideHandler(this));

					if(!blockers.length)
					{
						break;
					}
				}

				testX -= Math.cos(backAngle);
				testY -= Math.sin(backAngle);

				iterations++;

				if(iterations > maxIterations)
				{
					break;
				}
			}

			const below = this.checkBelow(testX, testY);

			if(Array.isArray(blockers))
			{
				if(this.willStick && blockers.filter(a => a.canStick).length)
				{
					this.args.ySpeed = 0;
					this.args.xSpeed = 0;
				}

				if(!below)
				{
					this.args.falling = true;
				}

			}
			else if(blockers)
			{
				if((this.willStick || below) && this.args.ySpeed > 0)
				{
					this.args.falling = false;

					const halfWidth = Math.floor(this.public.width / 2);

					const backPosition = this.findNextStep(-halfWidth);
					const forePosition = this.findNextStep(halfWidth);
					const sensorSpread = this.public.width;

					const newAngle = Math.atan2(forePosition[1] - backPosition[1], sensorSpread+1);

					if(isNaN(newAngle))
					{
						console.log(newAngle);
					}

					this.args.angle = this.args.groundAngle = newAngle;


					this.lastAngles.unshift(newAngle);
					this.lastAngles.splice(this.angleAvg);

					const slopeDir = -Math.sign(this.public.groundAngle);

					this.args.gSpeed = (1 + this.public.ySpeed) * slopeDir;
				}
				else if(!below)
				{
					this.args.falling = true;
				}

			}

			this.args.x = testX;
			this.args.y = testY;

			this.willJump = false;
		}
	}

	checkBelow(testX, testY)
	{
		let below = this.getMapSolidAt(
			testX + Math.floor(this.args.width / 2)
			, testY + 1
		);

		if(!below)
		{
			below = this.getMapSolidAt(
				testX - Math.floor(this.args.width / 2)
				, testY + 1
			);
		}

		if(Array.isArray(below))
		{
			below = below.filter(x => x.solid && x.callCollideHandler(this)).length;
		}

		return below;
	}

	processInput()
	{
		if(this.controllable
			&& this.args.standingOn
			&& this.args.standingOn.isVehicle
			&& this.args.standingOn.occupant === this
		){
			const vehicle = this.args.standingOn;

			vehicle.xAxis = this.xAxis;
			vehicle.yAxis = this.yAxis;

			vehicle.stayStuck = this.stayStuck;
			vehicle.willStick = this.willStick;

			this.processInputVehicle();

			this.args.direction = vehicle.public.direction;
			this.args.facing    = vehicle.public.facing;
			this.args.layer     = vehicle.public.layer;
			this.args.mode      = vehicle.public.mode;
			this.args.angle     = vehicle.public.angle;

			if(!vehicle.args.falling)
			{
				this.args.groundAngle = vehicle.args.groundAngle || 0;
			}
			else
			{
				this.args.groundAngle = (vehicle.args.flyAngle || 0) * -this.public.direction;
			}

			this.args.cameraMode = vehicle.args.cameraMode;

			// const seatX = (vehicle.args.seatX || 0) * this.args.direction;
			// const seatY = (vehicle.args.seatY || 0);

			// this.args.x = vehicle.args.x + seatX;
			// this.args.y = vehicle.args.y + vehicle.args.height + seatY;
		}
		else if(this.controllable)
		{
			this.processInputDirect();
		}
	}

	processInputDirect()
	{
		let xAxis = this.xAxis;
		let yAxis = this.yAxis;

		if(this.public.ignore !== 0)
		{
			xAxis = 0;
			yAxis = 0;
		}

		let gSpeedMax = this.public.gSpeedMax;

		if(this.running)
		{
			gSpeedMax = RUNNING_SPEED;
		}
		else if(this.crawling)
		{
			gSpeedMax = CRAWLING_SPEED;
		}

		if(!this.public.falling)
		{
			if(Math.abs(this.public.gSpeed) < 0.01)
			{
				this.args.rolling = false;

				this.public.gSpeed = 0;
			}
			else if(this.canRoll && this.yAxis > 0)
			{
				this.args.rolling = true;
			}
		}
		else
		{
			this.args.rolling = false;
		}

		const drag = this.region ? this.region.public.drag : 1;

		if(!this.public.falling)
		{
			if(xAxis && !this.public.rolling)
			{
				let gSpeed = this.public.gSpeed
				const axisSign = Math.sign(xAxis);
				const sign     = Math.sign(this.public.gSpeed);


				if(!this.public.rolling)
				{
					if(axisSign === sign || !sign)
					{
						gSpeed += xAxis * this.public.accel * drag;
					}
					else
					{
						gSpeed += xAxis  * this.public.accel * drag * this.public.skidTraction;
					}
				}

				if(Math.abs(gSpeed) > gSpeedMax)
				{
					gSpeed = gSpeedMax * Math.sign(gSpeed);
				}

				if(!Math.sign(this.public.gSpeed) || Math.sign(this.public.gSpeed) === Math.sign(gSpeed))
				{
					if(Math.abs(gSpeed) < gSpeedMax || Math.sign(gSpeed) !== xAxis)
					{
						this.args.gSpeed = gSpeed;
					}
				}
				else
				{
					this.args.gSpeed = 0;

					return;
				}
			}
		}
		else if(this.public.falling && xAxis && Math.abs(this.public.xSpeed) < this.args.xSpeedMax)
		{
			if(Math.abs(this.public.xSpeed) < this.args.flySpeedMax)
			{
				this.args.xSpeed += xAxis * this.public.airAccel * drag;
			}
		}

		if(xAxis < 0)
		{
			if(!this.public.climbing)
			{
				this.args.facing = 'left';
			}

			this.args.direction = -1;
		}

		if(xAxis > 0)
		{
			if(!this.public.climbing)
			{
				this.args.facing = 'right';
			}

			this.args.direction = 1;
		}

		if(this.aAxis < -0.75)
		{
			if(this.inventory.has(ElectricSheild))
			{
				this.args.currentSheild = [...this.inventory.get(ElectricSheild)][0];
			}
		}

		if(this.aAxis > +0.75)
		{
			if(this.inventory.has(FireSheild))
			{
				this.args.currentSheild = [...this.inventory.get(FireSheild)][0];
			}
		}

		if(this.bAxis < -0.75)
		{
			if(this.inventory.has(BubbleSheild))
			{
				this.args.currentSheild = [...this.inventory.get(BubbleSheild)][0];
			}
		}

		if(this.bAxis > +0.75)
		{
			this.args.currentSheild = '';
		}
	}

	processInputVehicle()
	{
		this.args.standingOn.processInputDirect();
	}

	collideA(other,type)
	{
		return this.solid;
	}

	collideB(other)
	{}

	findNextStep(offset)
	{
		if(!this.viewport)
		{
			return;
		}

		const viewport = this.viewport;
		const tileMap  = viewport.tileMap;
		const maxStep  = this.maxStep;

		const sign = Math.sign(offset);

		let downFirstSolid = false;
		let upFirstSpace   = false;

		let prevUp = 0, prevDown = 0, prev = 0;

		let col = 0;

		for(; col < Math.abs(offset); col += 1)
		{
			downFirstSolid = false;
			upFirstSpace   = false;

			let offsetPoint;

			const columnNumber = (1 + col) * sign;

			switch(this.public.mode)
			{
				case MODE_FLOOR:
					offsetPoint = [columnNumber, 1]
					break;

				case MODE_RIGHT:
					offsetPoint = [1, -columnNumber]
					break;

				case MODE_CEILING:
					offsetPoint = [-columnNumber, -1]
					break;

				case MODE_LEFT:
					offsetPoint = [-1, columnNumber]
					break;
			}

			downFirstSolid = this.castRay(
				maxStep * (1+col)
				, this.downAngle
				, offsetPoint
				, (i, point) => {
					if(tileMap.getSolid(point[0], point[1], this.public.layer))
					{
						return i;
					}

					const actors = viewport.actorsAtPoint(point[0], point[1])
						.filter(a => a.args !== this.args)
						.filter(a => (i <= 1 || this.public.gSpeed) && a.callCollideHandler(this))
						.filter(a => a.solid);

					if(actors.length > 0)
					{
						return i;
					}
				}
			);

			if(downFirstSolid === false)
			{
				return [false, false, true];
			}

			const downDiff = Math.abs(prevDown - downFirstSolid);

			if(Math.abs(downDiff) >= maxStep)
			{
				return [false, false, false, true];
			}

			if(downFirstSolid === 0)
			{
				let offsetPoint;

				switch(this.public.mode)
				{
					case MODE_FLOOR:
						offsetPoint = [columnNumber, 0]
						break;

					case MODE_RIGHT:
						offsetPoint = [0, -columnNumber]
						break;

					case MODE_CEILING:
						offsetPoint = [-columnNumber, 0]
						break;

					case MODE_LEFT:
						offsetPoint = [0, columnNumber]
						break;
				}

				const upLength = +1 + maxStep * (1 + col);

				upFirstSpace = this.castRay(
					upLength
					, this.upAngle
					, offsetPoint
					, (i, point) => {
						const actors = viewport.actorsAtPoint(point[0], point[1])
							.filter(x => x.args !== this.args)
							.filter(a => (i <= 1 || this.public.gSpeed) && a.callCollideHandler(this))
							.filter(x => x.solid);

						if(actors.length === 0)
						{
							if(!tileMap.getSolid(point[0], point[1], this.public.layer))
							{
								return i;
							}
						}

					}
				);

				const upDiff = Math.abs(prevUp - upFirstSpace);

				if(upFirstSpace === false)
				{
					return [false, false, false, true];
					return [(1+col) * sign, false, false, true];
				}

				if(upDiff >= maxStep)
				{
					return [false, false, false, true];
					return [(-1+col), prev, false, true];
				}

				prev = prevUp = upFirstSpace;
			}
			else
			{
				prev = prevDown = downFirstSolid;
			}
		}

		if(upFirstSpace !== false)
		{
			return [col * sign, upFirstSpace, false];
		}

		return [col * sign, -downFirstSolid, false];
	}

	castRay(...args)
	{
		let length   = 1;
		let callback = () => {};
		let angle    = Math.PI / 2;
		let offset   = [0,0];

		switch(args.length)
		{
			case 2:
				[length, callback] = args;
				break;
			case 3:
				[length, angle, callback] = args;
				break;
			case 4:
				[length, angle, offset, callback] = args;
				break;
		}

		let hit = false;

		for(let i = 0; i < Math.floor(length); i++)
		{
			const bottom  = [
				this.public.x + offset[0] + (i * Math.cos(angle))
				, this.public.y + offset[1] + (i * Math.sin(angle))
			];

			const retVal = callback(i, bottom);

			if(retVal !== undefined)
			{
				return retVal;
			}
		}

		return false;
	}

	doJump(force)
	{
		if(
			this.public.ignore
			|| this.public.falling
			|| !this.public.landed
			|| this.public.float
		){
			return;
		}

		const backPosition = this.findNextStep(Math.ceil(-this.public.width / 2));
		const forePosition = this.findNextStep(Math.ceil(this.public.width / 2));
		const sensorSpread = this.public.width;

		let groundAngle = Math.atan2(backPosition[1] - forePosition[1], Math.ceil(sensorSpread));

		this.args.ignore  = 6;
		this.args.landed  = false;
		this.args.falling = true;

		const originalMode = this.public.mode;

		switch(this.public.mode)
		{
			case MODE_FLOOR:
				this.args.y -= 16;
				break;

			case MODE_RIGHT:
				groundAngle += -Math.PI / 2;
				this.args.x += -this.public.width / 2;
				break;

			case MODE_CEILING:
				groundAngle += Math.PI;
				this.args.y += this.public.height;
				break;

			case MODE_LEFT:
				groundAngle += Math.PI / 2;
				this.args.x += this.public.width / 2;
				break;
		}


		this.args.xSpeed = this.public.gSpeed * Math.cos(groundAngle);
		this.args.ySpeed = this.public.gSpeed * Math.sin(groundAngle);

		const jumpAngle = groundAngle - Math.PI / 2;

		let xJump = force * Math.cos(jumpAngle);
		let yJump = force * Math.sin(jumpAngle);

		if(Math.abs(xJump) < 0.01)
		{
			xJump = 0;
		}

		if(Math.abs(yJump) < 0.01)
		{
			yJump = 0;
		}

		this.args.airAngle = jumpAngle;

		this.args.xSpeed += xJump;
		this.args.ySpeed += yJump;

		this.args.jumpedAt = this.y;
		this.args.jumping  = true;

		this.args.mode  = DEFAULT_GRAVITY;
	}

	impulse(magnitude, direction, willFall = false)
	{
		this.impulseMag = magnitude;
		this.impulseDir = direction;
		this.impulseFal = willFall;
	}

	rad2deg(rad)
	{
		const deg = (180 / Math.PI * rad);

		if(deg > 0)
		{
			return Math.floor(deg * 10) / 10;
		}

		return Math.ceil(deg * 10) / 10;
	}

	roundAngle(angle, segments)
	{
		segments /= 2;

		let rAngle = Math.round(

			angle / (Math.PI/segments)

		) * Math.PI/segments;

		return rAngle;
	}

	findNearestActor(selector, maxDistance, direction = 0)
	{
		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		const cells = viewport.getNearbyColCells(this);

		const actors = new Map;

		cells.map(s => s.forEach(a =>{

			if(a === this)
			{
				return;
			}

			if(a.public.gone)
			{
				return;
			}

			if(!selector(a))
			{
				return;
			}

			const distance = this.distanceFrom(a);
			const angle    = Math.atan2(a.y - this.y, a.x - this.x);

			if(Math.abs(distance) > maxDistance)
			{
				return;
			}

			actors.set(distance, a);
		}));

		const distances = [...actors.keys()];
		const shortest  = Math.min(...distances);

		const closest = actors.get(shortest);

		return closest;
	}

	scanForward(speed, height = 0.5, scanActors = true)
	{
		const dir      = Math.sign(speed);
		const radius   = Math.round(this.public.width / 2);
		const hRadius  = Math.round(this.public.height / 2);
		const scanDist = Math.abs(speed);
		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		const tileMap  = viewport.tileMap;

		const startPoint = this.rotatePoint(radius * -dir, this.public.height * height);

		return this.castRay(
			scanDist
			, this.public.falling
				? Math.sign(speed) > 0 ? 0 : Math.PI
				: this.realAngle + (Math.sign(speed) < 0 ? Math.PI : 0)
			, startPoint
			, (i, point) => {

				if(scanActors)
				{
					const actors = viewport.actorsAtPoint(point[0], point[1])
						.filter(x => x.args !== this.args)
						.filter(x => (i <= radius) && x.callCollideHandler(this))
						.filter(x => x.solid);

					if(actors.length > 0)
					{
						return i;
					}
				}


				if(tileMap.getSolid(point[0], point[1], this.public.layer))
				{
					return i;
				}
			}
		);
	}

	scanBottomEdge(direction = 1)
	{
		const tileMap = this.viewport.tileMap;

		return this.castRay(
			this.public.width
			, (direction < 0 ? Math.PI : 0)
			, [-direction * (this.public.width/2), 0]
			, (i,point) => {
				const actors = this.viewport
					.actorsAtPoint(point[0], point[1] + 1)
					.filter(a => a.args !== this.args);

				if(!actors.length && !tileMap.getSolid(point[0], point[1] + 1, this.public.layer))
				{
					return i;
				}
			}
		);
	}

	scanVerticalEdge(direction = 1)
	{
		const tileMap = this.viewport.tileMap;

		return this.castRay(
			this.public.height + 1
			, Math.PI / 2
			, [direction * this.public.width / 2, -this.public.height]
			, (i,point) => {

				const actors = this.viewport
					.actorsAtPoint(point[0], point[1])
					.filter(a => a.args !== this.args);

				if(actors.length || tileMap.getSolid(point[0], point[1], this.public.layer))
				{
					return i;
				}
			}
		);
	}

	get realAngle()
	{
		if(this.public.falling)
		{
			return Math.PI;
		}

		const groundAngle = Number(this.public.groundAngle);

		let trajectory;

		switch(this.public.mode)
		{
			case 0:
				trajectory = -groundAngle - (Math.PI);
				break;
			case 1:
				trajectory = -groundAngle - (Math.PI / 2);
				break;
			case 2:
				trajectory = -groundAngle;
				break;
			case 3:
				trajectory = -groundAngle + (Math.PI / 2);
				break;
		}

		return trajectory;
	}

	get downAngle()
	{
		switch(this.public.mode)
		{
			case MODE_FLOOR:
				return Math.PI/2;
				break;

			case MODE_RIGHT:
				return 0;
				break;

			case MODE_CEILING:
				return -Math.PI/2;
				break;

			case MODE_LEFT:
				return Math.PI;
				break;
		}
	}

	get upAngle()
	{
		switch(this.public.mode)
		{
			case MODE_FLOOR:
				return -Math.PI/2;
				break;

			case MODE_RIGHT:
				return Math.PI;
				break;

			case MODE_CEILING:
				return Math.PI/2;
				break;

			case MODE_LEFT:
				return 0;
				break;
		}
	}

	get leftAngle()
	{
		switch(this.public.mode)
		{
			case MODE_FLOOR:
				return Math.PI;
				break;

			case MODE_RIGHT:
				return -Math.PI/2;
				break;

			case MODE_CEILING:
				return 0;
				break;

			case MODE_LEFT:
				return Math.PI/2;
				break;
		}
	}

	get rightAngle()
	{
		switch(this.public.mode)
		{
			case MODE_FLOOR:
				return 0;
				break;

			case MODE_RIGHT:
				return Math.PI/2;
				break;

			case MODE_CEILING:
				return Math.PI;
				break;

			case MODE_LEFT:
				return -Math.PI/2;
				break;
		}
	}

	get groundPoint()
	{
		switch(this.public.mode)
		{
			case MODE_FLOOR:
				return [this.x + 0, this.y + 1];
				break;

			case MODE_RIGHT:
				return [this.x + 1, this.y + 0];
				break;

			case MODE_CEILING:
				return [this.x + 0, this.y - 1];
				break;

			case MODE_LEFT:
				return [this.x - 1, this.y + 0];
				break;
		}
	}

	rotatePoint(x,y)
	{
		const xRot = x * Math.cos(this.realAngle) - y * Math.sin(this.realAngle);
		const yRot = y * Math.cos(this.realAngle) + x * Math.sin(this.realAngle);

		return [xRot, yRot];
	}

	standBelow(other)
	{
	}

	getMapSolidAt(x, y, actors = true)
	{
		if(!this.viewport)
		{
			return;
		}

		if(actors)
		{
			const actors = this.viewport.actorsAtPoint(x,y)
				.filter(x=>x.args!==this.args)
				.filter(x=>x.solid);

			if(actors.length > 0)
			{
				return actors;
			}
		}

		const tileMap = this.viewport.tileMap;

		return tileMap.getSolid(x,y, this.public.layer);
	}

	get canRoll() { return false; }
	get canStick() { return false; }
	get canSpindash() { return false; }
	get isEffect() { return false; }
	get isGhost() { return false; }
	get isPushable() { return false; }
	get isVehicle() { return false; }
	get solid() { return false; }

	get x() { return this.public.x }
	get y() { return this.public.y }
	get point() { return [this.public.x, this.public.y] }
	get rotateLock() { return false; }
	get controllable() { return false; }
	get skidding() { return Math.abs(this.public.gSpeed) && Math.sign(this.public.gSpeed) !== this.public.direction }

	readInput()
	{
		if(!this.controller)
		{
			return;
		}

		const controller = this.controller;

		if(controller.axes[0])
		{
			this.xAxis = controller.axes[0].magnitude;
		}

		if(controller.axes[1])
		{
			this.yAxis = controller.axes[1].magnitude;
		}

		if(controller.axes[2])
		{
			this.aAxis = controller.axes[2].magnitude;
		}

		if(controller.axes[3])
		{
			this.bAxis = controller.axes[3].magnitude;
		}

		const buttons = controller.buttons;

		for(const i in buttons)
		{
			const button = buttons[i];

			const release = `release_${i}`;
			// const change  = `change_${i}`;
			const press   = `command_${i}`;
			const hold    = `hold_${i}`;

			if(!this.args.standingOn || !this.args.standingOn.isVehicle || i == 0)
			{
				if(button.delta === 1)
				{
					this[press] && this[press]( button );
				}
				else if(button.delta === -1)
				{
					this[release] && this[release]( button );
				}
				else if(button.active)
				{
					this[hold] && this[hold]( button );
				}
			}
			else if(this.args.standingOn && this.args.standingOn.isVehicle)
			{
				const vehicle = this.args.standingOn;

				if(button.delta === 1)
				{
					vehicle[press] && vehicle[press]( button );
				}
				else if(button.delta === -1)
				{
					vehicle[release] && vehicle[release]( button );
				}
				else if(button.active)
				{
					vehicle[hold] && vehicle[hold]( button );
				}
			}
		}
	}

	command_0() // jump
	{
		if(this.public.falling || this.willJump || this.public.dontJump)
		{
			return;
		}

		if(!this.willJump)
		{
			this.willJump = true;
		}
	}

	release_0()
	{
		if(this.args.jumping && this.args.ySpeed < 0)
		{
			this.args.ySpeed *= 0.5;
		}
	}

	distanceFrom({x,y})
	{
		const aSquared = (this.x - x)**2;
		const bSquared = (this.y - y)**2;
		const cSquared = aSquared + bSquared;

		if(cSquared)
		{
			return Math.sqrt(cSquared);
		}

		return 0;
	}

	twist(warp)
	{
		if(!this.twister)
		{
			const filterContainer = this.viewport.tags.bgFilters;

			const html = `<div class = "point-actor-filter twist-filter">`;

			this.twistFilter = new Tag(html);

			filterContainer.appendChild(this.twistFilter.node);

			this.twister = new Twist({id: 'twist-' + this.args.id, scale: 60});

			this.twister.args.bindTo(['x', 'y', 'width', 'height', 'xOff', 'yOff'], (v,k) => {
				this.twistFilter.style({
					[`--${k}`]: v, filter: `url(#twist-${this.args.id})`
				});
			});

			this.twister.render(this.sprite);
		}

		this.twister.args.scale = warp;
	}

	pinch(warpBg = 0, warpFg = 0)
	{
		if(!this.pincherBg)
		{
			const filterContainer = this.viewport.tags.bgFilters;

			const type = this.args.type.split(' ').shift();
			const html = `<div class = "point-actor-filter pinch-filter">`;

			this.pinchFilterBg = new Tag(html);

			filterContainer.appendChild(this.pinchFilterBg.node);

			this.pincherBg = new Pinch({id: 'pinch-' + this.args.id, scale: 60});

			this.pincherBg.args.bindTo(['x', 'y', 'width', 'height', 'xOff', 'yOff'], (v,k) => {
				this.pinchFilterBg.style({
					[`--${k}`]: v, filter: `url(#pinch-${this.args.id})`
				});
			});

			this.args.yOff = 16;

			this.pincherBg.render(this.sprite);
		}

		this.pincherBg.args.scale = warpBg;

		if(!this.pincherFg)
		{
			const filterContainer = this.viewport.tags.fgFilters;

			const type = this.args.type.split(' ').shift();
			const html = `<div class = "point-actor-filter pinch-filter">`;

			this.pinchFilterFg = new Tag(html);

			filterContainer.appendChild(this.pinchFilterFg.node);

			this.pincherFg = new Pinch({id: 'pinch-fg-' + this.args.id, scale: 60});

			this.pincherFg.args.bindTo(['x', 'y', 'width', 'height', 'xOff', 'yOff'], (v,k) => {
				this.pinchFilterFg.style({
					[`--${k}`]: v, filter: `url(#pinch-fg-${this.args.id})`
				});
			});

			this.args.yOff = 16;

			this.pincherFg.render(this.sprite);
		}

		this.pincherFg.args.scale = warpFg;
	}

	sleep()
	{
	}

	wakeUp()
	{}

	urlWrap(url)
	{
		return `url(${url})`;
	}
}
