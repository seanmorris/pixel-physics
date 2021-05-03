import { Bindable } from 'curvature/base/Bindable';
import { View } from 'curvature/base/View';
import { Tag  } from 'curvature/base/Tag';

import { Twist } from '../effects/Twist';
import { Droop } from '../effects/Droop';
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
	static lastClick = 0;

	template = `<div
		class  = "point-actor [[type]]"
		style  = "
			display:[[display]];
			--fg-filter:[[fgFilter]];
			--animation-bias:[[animationBias]];
			--bg-filter:[[bgFilter]];
			--sprite-sheet:[[spriteSheet|urlWrap]];
			--sprite-x:[[spriteX]];
			--sprite-y:[[spriteY]];
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
			// , rollSpeedMax = 37;
		}
	};

	static fromDef(objDef)
	{
		const objArgs = {
			x:         objDef.x + 16
			, y:       objDef.y - 1
			, visible: objDef.visible
			, name:    objDef.name
			, id:      objDef.id
		};

		const def = new Map;

		for(const i in objArgs)
		{
			if(typeof objArgs[i] === 'object')
			{
				continue;
			}

			def.set(i, objArgs[i]);
		}

		for(const i in objDef.properties)
		{
			const property = objDef.properties[i];

			objArgs[ property.name ] = property.value;

			def.set(property.name, property.value);
		}

		const instance =  new this(Object.assign({}, objArgs));

		instance.def = def;

		instance.args.float = instance.float ?? instance.args.float;

		return instance;
	}

	constructor(...args)
	{
		args[ Bindable.NoGetters ] = true;

		super(...args);

		this[ Bindable.NoGetters ] = true;

		this.fallTime  = 0;

		this.regions   = new Set;
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

		this.args.type = 'actor-generic';
		this.args.modeTime = 0;

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

		this.args.groundAngle = this.args.groundAngle || 0;
		this.args.airAngle    = 0;

		this.lastAngles = [];
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

		this.maxStep   = 7;
		this.backStep  = 0;
		this.frontStep = 0;

		this.args.rolling = false;

		this.args.skidTraction = 2.25;
		this.args.skidTraction = 5;

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

		this.args.bindTo(['x','y'], (v, k) => isNaN(v) && console.trace(k, v));

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

		this.debindGroundX = new Set;
		this.debindGroundY = new Set;
		this.debindGroundL = new Set;

		this.args.bindTo(['mode', 'falling'], () => {
			this.args.modeTime = 0;
		});

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

			if(prevGroundObject && prevGroundObject.isVehicle)
			{
				prevGroundObject.occupant  = null;
				prevGroundObject.stayStuck = false;
				prevGroundObject.willStick = false;

				prevGroundObject.xAxis = 0;
				prevGroundObject.yAxis = 0;
			}

			if(!groundObject)
			{

				return;
			}

			if(this.controllable && groundObject.isVehicle)
			{
				const debindGroundX = groundObject.args.bindTo('x', (vv,kk) => {
					const x = groundObject.args.direction * groundObject.args.seatForward || 0;
					const y = groundObject.args.seatHeight  || groundObject.args.height || 0;

					// const xRot = x * Math.cos(groundObject.realAngle) - y * Math.sin(groundObject.realAngle);
					// const yRot = y * Math.cos(groundObject.realAngle) + x * Math.sin(groundObject.realAngle);

					const [xRot, yRot] = groundObject.rotatePoint(x, y);

					this.args.x = xRot + vv;
					this.args.y = yRot + groundObject.y;
				});

				const debindGroundY = groundObject.args.bindTo('y', (vv,kk) => {
					const x = groundObject.args.direction * groundObject.args.seatForward || 0;
					const y = groundObject.args.seatHeight || groundObject.args.height || 0;

					// const xRot = x * Math.cos(groundObject.realAngle) - y * Math.sin(groundObject.realAngle);
					// const yRot = y * Math.cos(groundObject.realAngle) + x * Math.sin(groundObject.realAngle);

					const [xRot, yRot] = groundObject.rotatePoint(x, y);

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

				groundObject.args.yMargin = this.args.height;

				if(occupant && occupant !== this)
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

				this.args.falling = false

				groundObject.occupant = this;
			}
			else if(!groundObject.isVehicle)
			{
				if(this.y <= this.public.height + groundObject.y - groundObject.args.height)
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
		if(this.init)
		{
			return;
		}

		const regionClass = this.viewport.objectPalette['base-region']

		this.isRegion = this instanceof regionClass;

		this.box    = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.init = true;

		if(this.controllable)
		{
			this.sprite.parentNode.classList.add('controllable');
		}

		this.listen('click', ()=>{

			const now = Date.now();

			const timeSince = now - PointActor.lastClick;

			console.log(timeSince);

			if(timeSince < 1000)
			{
				this.viewport.auras.add(this);

				const clear = this.viewport.onFrameInterval(1, () => {

					const frame = this.viewport.serializePlayer();


					this.viewport.onFrameOut(5, () => {

						if(frame.input)
						{
							this.controller.replay(frame.input);
							this.readInput();
						}

						if(frame.args)
						{
							Object.assign(this.args, frame.args);

							this.viewport.setColCell(this);
						}
					});

				});

				this.onRemove(clear);

				return;
			}

			PointActor.lastClick = now;

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

	update()
	{
		if(this.args.currentSheild && 'update' in this.args.currentSheild)
		{
			this.args.currentSheild.update(this);
		}

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

		this.args.modeTime++;

		if(this.args.standingOn && this.args.standingOn.isVehicle)
		{
			const vehicle = this.args.standingOn;

			this.args.falling = true;
			this.args.flying  = false;
			this.args.jumping = false;

			this.processInput();

			this.args.cameraMode = vehicle.args.cameraMode;

			if(this.willJump && this.yAxis < 0)
			{
				this.args.standingOn = false;
				this.willJump   = false;

				this.args.falling = true;
				this.args.jumping = true;

				this.args.y -= vehicle.public.seatHeight || vehicle.public.height;

				this.args.xSpeed = vehicle.public.direction * 2;
				this.args.ySpeed = -this.public.jumpForce;
				vehicle.args.ySpeed = 0;
			}

			this.args.groundAngle = vehicle.args.groundAngle || 0;

			if(this.willJump && this.yAxis >= 0)
			{
				this.willJump = false;

				this.args.standingOn.falling = false;

				this.args.standingOn.command_0();
			}

			return;
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
						break;

					case MODE_CEILING:
						this.args.gSpeed = -Math.cos(this.impulseDir) * this.impulseMag;
						break;

					case MODE_LEFT:
						this.args.gSpeed = -Math.sin(this.impulseDir) * this.impulseMag;
						break;

					case MODE_RIGHT:
						this.args.gSpeed = Math.sin(this.impulseDir) * this.impulseMag;
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
			this.args.ignore = 0;
		}

		if(this.public.ignore === -3 && (!this.public.falling || this.public.ySpeed >= 0))
		{
			this.args.ignore = 0;
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

		if(this.public.standingOn)
		{
			this.public.standingOn.callCollideHandler(this);
		}

		if(!this.public.float && this.public.falling)
		{
			if(!this.args.standingOn || !this.args.standingOn.isVehicle)
			{
				this.args.standingOn = null;
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
				else if(this.public.jumping)
				{
					this.args.deepJump = false;
				}
			}
		}
		else if(this.public.jumping && !this.public.falling)
		{
			this.args.jumping  = false;
			this.args.deepJump = false;
			this.args.highJump = false;
			this.args.jumpedAt = null;
		}

		const drag = this.getLocalDrag();

		const regions = this.viewport.regionsAtPoint(this.x, this.y);

		for(const region of this.regions)
		{
			region.updateActor(this);
		}

		let gSpeedMax = this.public.gSpeedMax;

		if(!this.isRegion)
		{
			for(const region of this.regions)
			{
				if(!regions.has(region))
				{
					this.regions.delete(region);

					this.crossRegionBoundary(region);
				}
			}

			for(const region of regions)
			{
				if(this.public.density)
				{
					if(region.public.density && this.public.density < region.public.density)
					{
						const densityRatio = region.public.density / this.public.density;

						const myTop     = this.y - this.public.height;
						const regionTop = region.y - region.public.height;

						const depth = Math.min((myTop - regionTop) / this.public.height, 1);

						this.args.float = 1;

						const force = depth * drag;

						this.args.falling = true;

						if(depth > -1)
						{
							this.args.ySpeed -= force;

							this.args.ySpeed *= drag;
						}
						else if(depth < -1 && this.args.ySpeed < 0)
						{
							if(Math.abs(depth) < 0.25 && Math.abs(this.args.ySpeed) < 1)
							{
								this.args.ySpeed = 0;
								this.args.y = -1 + regionTop + this.args.height;
							}
						}
					}
				}

				if(!this.regions.has(region))
				{
					this.regions.add(region);

					this.crossRegionBoundary(region);
				}
			}

			// if(!regions.size && this.def)
			// {
			// 	this.args.float = this.def.get('float') ?? this.args.float ?? 0;
			// }
		}

		if(this.willJump && !this.public.dontJump && (!this.public.falling || this.falltime < 2))
		{
			this.willJump = false;

			const tileMap = this.viewport.tileMap;

			let headPoint;

			switch(this.public.mode)
			{
				case MODE_FLOOR:
					headPoint = [this.x, this.y - this.public.height];
					break;

				case MODE_CEILING:
					headPoint = [this.x, this.y + this.public.height];
					break;

				case MODE_LEFT:
					headPoint = [this.x + this.public.height, this.y];
					break;

				case MODE_RIGHT:
					headPoint = [this.x - this.public.height, this.y];
					break;
			}

			if(!tileMap.getSolid(...headPoint, this.public.layer))
			{
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
			}

			return;
		}

		if(!this.isRegion && !this.isEffect && this.public.falling && this.viewport)
		{
			this.updateAirPosition();
		}
		else if(!this.isRegion &&!this.isEffect && !this.public.falling)
		{
			this.updateGroundPosition();

			this.args.animationBias = Math.abs(this.args.gSpeed / this.args.gSpeedMax).toFixed(1);

			if(this.args.animationBias > 1)
			{
				this.args.animationBias = 1;
			}
		}

		const halfWidth  = Math.ceil(this.args.width/2);
		const halfHeight = Math.floor(this.args.height/2);

		// if(!this.isRegion && (this.public.pushed || ( !this.willStick && this.controllable )))
		if(!this.isRegion && this.public.pushed)
		{
			const testWallPoint = (direction) => {
				switch(this.public.mode)
				{
					case MODE_FLOOR:
						return this.getMapSolidAt(
							this.x + halfWidth * direction + (direction === -1 ? 1 : 0)
							, this.y - halfHeight
						);

					case MODE_CEILING:
						return this.getMapSolidAt(
							this.x + halfWidth * direction + (direction === -1 ? 1 : 0)
							, this.y + halfHeight
						);

					case MODE_LEFT:
						return this.getMapSolidAt(
							this.x + halfHeight * (direction === -1 ? 0 : 2)
							, this.y
						)

					case MODE_RIGHT:
						return this.getMapSolidAt(
							this.x - halfHeight * (direction === -1 ? 0 : 2)
							, this.y
						)
				}
			};

			const leftWall  = testWallPoint(-1);
			const rightWall = testWallPoint(1);

			if(rightWall && !leftWall)
			{
				if(this.public.xSpeed > 0)
				{
					this.args.xSpeed = 0;
				}

				this.args.x--;
			}

			if(leftWall && !rightWall)
			{
				if(this.public.xSpeed > 0)
				{
					this.args.xSpeed = 0;
				}

				this.args.x++;
			}
		}

		if(!this.viewport || this.removed)
		{
			return;
		}

		const layerSwitch  = this.viewport.objectPalette['layer-switch'];
		const regionClass  = this.viewport.objectPalette['base-region'];
		const skipChecking = [regionClass];

		if(!(skipChecking.some(x => this instanceof x)))
		{
			this.viewport.actorsAtPoint(this.x, this.y, this.public.width, this.public.height)
				.filter(x => x.args !== this.args)
				.filter(x => !(x.isPushable))
				.filter(x => x.callCollideHandler(this, false));
		}

		if(!this.viewport || this.removed)
		{
			return;
		}

		const tileMap = this.viewport.tileMap;

		if(Math.abs(this.public.gSpeed) <= 4 && !this.public.falling)
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
						if(mode === MODE_LEFT && this.public.groundAngle <= Math.PI / 4)
						{
							if(this.public.groundAngle === 0)
							{
								this.args.xSpeed = 0.3;
								this.public.mode = MODE_FLOOR
								this.args.falling = true;
								this.args.groundAngle = -Math.PI / 2;
								this.args.x++;
							}

							if(this.args.gSpeed <= 0)
							{
								this.args.gSpeed = 0;
							}

							this.args.gSpeed++;

							this.args.ignore = 15;

						}
						else if(mode === MODE_RIGHT && this.public.groundAngle >= -Math.PI / 4)
						{
							if(this.public.groundAngle === 0)
							{
								this.args.xSpeed = -0.3;
								this.public.mode = MODE_FLOOR
								this.args.falling = true;
								this.args.groundAngle = Math.PI / 2;
								this.args.x--;
							}

							if(this.args.gSpeed >= 0)
							{
								this.args.gSpeed = 0;
							}

							this.args.gSpeed--;

							this.args.ignore = 15;
						}
						else if(mode === MODE_CEILING)
						{
							this.args.ignore = 8;
							this.args.falling = true;

							const gSpeed = this.args.gSpeed;

							this.onNextFrame(() => {
								this.args.groundAngle = Math.PI;
								this.args.xSpeed = -gSpeed;
								this.args.mode = MODE_FLOOR;
							});

							if(this.public.direction == -1)
							{
								this.args.facing = 'left'
								this.args.x++;
							}
							else
							{
								this.args.facing = 'right'
								this.args.x--;
							}

						}
					}
				}
			}
		}

		this.args.landed = true;

		this.args.x = Math.floor(this.public.x);
		this.args.y = Math.floor(this.public.y);

		if(this.public.falling && !this.isEffect && (this.public.xSpeed || this.public.ySpeed))
		{
			this.resolveIntersection();
		}

		if(!this.public.falling && !this.isRegion)
		{
			if(this.public.mode === MODE_FLOOR && !this.public.gSpeed && !this.public.xSpeed)
			{
				while(this.getMapSolidAt(this.x, this.y - 1, false))
				{
					this.args.ySpeed = 0;
					this.args.y--;
				}
			}
		}

		if(this.public.falling)
		{
			this.args.gSpeed = 0;
		}

		this.controllable && this.processInput();

		if(this.public.falling || this.public.gSpeed)
		{
			this.args.stopped = 0;
		}
		else
		{
			this.args.stopped++;
		}

		if(this.lastAngles.length > 0)
		{
			this.args.groundAngle = this.lastAngles.map(a=>Number(a)).reduce(((a,b)=>a+b)) / this.lastAngles.length;
		}

		if(isNaN(this.public.groundAngle))
		{
			console.log(this.lastAngles, this.lastAngles.length);
		}

		const regionsBelow = this.viewport.regionsAtPoint(...this.groundPoint);
		const standingOn   = this.getMapSolidAt(...this.groundPoint);

		if(Array.isArray(standingOn) && standingOn.length)
		{
			const groundActors = standingOn.filter(
				a => a.args !== this.args && a.solid //a.callCollideHandler(this)
			);

			if(groundActors.length)
			{
				for(const groundActor of groundActors)
				{
					if(!groundActor.isVehicle && this.y > 1 + groundActor.y + -groundActor.args.height)
					{
						continue;
					}

					this.args.groundAngle = groundActor.groundAngle || 0;
					this.args.standingOn  = groundActor;
				}
			}
		}
		else if(standingOn)
		{
			this.args.standingOn = null;
		}
		else if(this.public.mode === MODE_FLOOR && regionsBelow.size)
		{
			let falling = !standingOn;

			for(const region of regionsBelow)
			{
				if(this.y === region.y - region.public.height
					&& Math.abs(this.args.gSpeed) >= region.skimSpeed
				){
					falling = false;
					break;
				}
			}

			this.args.standingOn = null;
			this.args.falling = falling;
		}
		else
		{
			this.args.standingOn = null;
			this.args.falling = true;
		}

		if(this.public.falling && this.public.ySpeed < this.public.ySpeedMax)
		{
			if(!this.public.float)
			{
				let gravity = 1;

				for(const region of this.regions)
				{
					if(!region.public.gravity && region.public.gravity !== 1)
					{
						continue;
					}

					gravity *= region.public.gravity;
				}

				this.args.ySpeed += this.public.gravity * gravity;
			}

			this.args.landed = false;
		}

		if(!this.public.falling)
		{
			this.checkDropDash();
		}

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

		if(this.public.falling)
		{
			this.args.rolling = false;
			this.fallTime++;
		}
	}

	popOut(other)
	{
		const halfWidth  = this.args.width / 2;
		const otherHalfWidth = other.args.width / 2;

		const topSide    = this.y - this.args.height + 1;
		const bottomSide = this.y;

		const distance = this.x - other.x;
		const minDistance = halfWidth + otherHalfWidth;

		if(this.solid && Math.abs(distance) < Math.abs(minDistance) && bottomSide > other.y && other.y > topSide)
		{
			other.args.x = this.x + minDistance * -Math.sign(distance);
		}

	}

	getLocalDrag()
	{
		let drag = 1;

		for(const region of this.regions)
		{
			if(!region.public.drag && region.public.drag !== 0)
			{
				continue;
			}

			if(region.public.drag < drag)
			{
				drag = region.public.drag;
			}
		}

		return drag;
	}

	updateGroundPosition()
	{
		const drag = this.getLocalDrag();

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
			const radius    = Math.floor(this.public.width / 2);
			const scanDist  = radius + Math.abs(this.public.gSpeed);
			const direction = Math.sign(this.public.gSpeed || this.public.direction);

			const max  = Math.abs(this.public.gSpeed);
			const step = 1;

			this.pause(true);

			// const testStep = (radius + 1) * direction;

			// if(Math.abs(testStep) > max)
			// {
			// 	const testPosition = this.findNextStep(testStep);

			// 	if(testPosition.length > 2 && testPosition[3])
			// 	{
			// 		this.args.moving = false;
			// 		this.args.gSpeed = 0;

			// 		this.pause(false);
			// 	}
			// }

			for(let s = 0; s < max; s += step)
			{
				nextPosition = this.findNextStep(step * direction);


				if(!nextPosition)
				{
					break;
				}

				if(this.public.width > 1)
				{
					const scanForwardHead = this.scanForward(step * direction, 1);

					if(scanForwardHead !== false)
					{
						this.args.gSpeed = scanForwardHead;

						break;
					}

					if(!this.public.rolling)
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
					// nextPosition[0] = step;
					// nextPosition[1] = 0;

					const gSpeed = this.public.gSpeed;
					const gAngle = this.public.groundAngle;

					switch(this.public.mode)
					{
						case MODE_FLOOR:
							this.args.x      += Math.sign(this.public.direction);

							this.args.xSpeed =  gSpeed * Math.cos(gAngle);
							this.args.ySpeed = -gSpeed * Math.sin(gAngle);

							this.args.float   = this.args.float < 0 ? this.args.float : 1;
							this.args.falling = !!this.public.gSpeed;

							break;

						case MODE_CEILING:

							this.args.float = this.args.float < 0 ? this.args.float : 1;

							this.args.falling = true;

							this.args.y += 2;

							this.onNextFrame(() => {
								this.args.xSpeed = -gSpeed * Math.cos(gAngle);
								this.args.ySpeed = gSpeed * Math.sin(gAngle);
								this.args.groundAngle += Math.PI;
								this.args.mode = MODE_FLOOR;
							});

							break;

						case MODE_LEFT:
							if(Math.abs(this.public.gSpeed) < 8 && !this.public.rolling)
							{
								if(this.public.gSpeed < 0)
								{
									this.args.x -= this.public.direction;
									this.args.y--;
								}
								else
								{
									this.args.x += radius;
									this.args.y++;
								}

							}
							else
							{
								this.args.ignore = -3;
								this.args.x += 2;
								this.xAxis = 0;
							}

							this.args.ySpeed  =  gSpeed * Math.cos(gAngle);
							this.args.xSpeed  =  gSpeed * Math.sin(gAngle);

							this.onNextFrame(() => {
								this.args.groundAngle = -Math.PI * 0.5;
								this.args.mode = MODE_FLOOR;
							});

							this.args.falling = true;

							break;

						case MODE_RIGHT:
							if(Math.abs(this.public.gSpeed) < 8 && !this.public.rolling)
							{
								if(this.public.gSpeed > 0)
								{
									this.args.x -= this.public.direction;
									this.args.y--;
								}
								else
								{
									this.args.x -= radius;
									this.args.y++;

								}

							}
							else
							{
								this.args.ignore = -3;
								this.args.x -= 2;
								this.xAxis = 0;
							}

							this.args.ySpeed  = -gSpeed * Math.cos(gAngle);
							this.args.xSpeed  = -gSpeed * Math.sin(gAngle);

							this.onNextFrame(() => {
								this.args.groundAngle = Math.PI * 0.5;
								this.args.mode = MODE_FLOOR;
							});

							this.args.falling = true;

							break;
					}

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

			if(!this.xAxis && this.public.gSpeed > 0)
			{
				if(this.public.rolling)
				{
					this.args.gSpeed -= this.public.decel * 1/drag * 0.06125;
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
					this.args.gSpeed += this.public.decel * 1/drag * 0.06125;
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

			let slopeFactor = 0;

			if(!this.args.climbing)
			{
				switch(this.args.mode)
				{
					case MODE_FLOOR:

						slopeFactor = this.public.groundAngle / (Math.PI/2);

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
							slopeFactor = -1;

							slopeFactor -= this.public.groundAngle / (Math.PI/4);
						}
						else
						{
							slopeFactor = 1;

							slopeFactor += this.public.groundAngle / (Math.PI/4) ;
						}
						break;

					case MODE_LEFT:

						if(direction > 0)
						{
							slopeFactor = 1;

							slopeFactor -= this.public.groundAngle / (Math.PI/4);
						}
						else
						{
							slopeFactor = -1;

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
						if(Math.abs(this.public.gSpeed) < this.public.rollSpeedMax)
						{
							this.args.gSpeed *= 1.0075 * (1+(slopeFactor/2) * 0.055);
						}
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
						if(slopeFactor <= -1)
						{
							this.args.gSpeed *= -0.5;
							this.args.ignore = this.args.ignore || 8;
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
		}

		if(nextPosition && (nextPosition[0] !== false || nextPosition[1] !== false))
		{
		}
		else
		{
			this.args.ignore = this.public.ignore || 1;

			this.args.gSpeed = 0;
		}
	}

	updateAirPosition()
	{
		const xSpeedOriginal = this.public.xSpeed;
		const ySpeedOriginal = this.public.ySpeed;

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

		let lastPoint = [this.x, this.y];
		let lastPointB = [this.x, this.y];
		let lastForePoint = [this.x, this.y];
		const tileMap   = this.viewport.tileMap;

		if(tileMap.getSolid(this.x + (this.public.width / 2) * Math.sign(this.args.xSpeed), this.y, this.public.layer))
		{
			if(tileMap.getSolid(this.x + (1 + this.public.width / 2) * Math.sign(this.args.xSpeed), this.y, this.public.layer))
			{
				// this.args.x -= 1 * Math.sign(this.args.xSpeed);
			}

			this.args.xSpeed = 0;
		}

		if(this.lastAngles.length)
		{
			this.lastAngles.splice(0);
		}

		if(this.controllable || this.isVehicle)
		{
			this.args.groundAngle += -Math.sign(this.args.groundAngle) * 0.001 * (this.xAxis ? 25 : 10);
		}


		if(Math.abs(this.args.groundAngle) < 0.01)
		{
			this.args.groundAngle = 0;
		}

		const foreDistanceHead  = this.scanForward(this.public.xSpeed, 1.0);
		const foreDistanceWaist = this.scanForward(this.public.xSpeed, 0.5);
		const foreDistanceFoot  = this.scanForward(this.public.xSpeed, 0.0);

		const distances = [foreDistanceHead, foreDistanceWaist, foreDistanceFoot];

		const hits = distances.filter(x => x !== false);

		if(!this.willStick && hits.length)
		{
			const dist = Math.sign(this.public.xSpeed || this.public.direction);

			this.args.x += Math.min(...distances) * dist;

			if(foreDistanceWaist || foreDistanceFoot)
			{
				this.args.flySpeed = 0;
				this.args.xSpeed = 0;
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
			, -Math.PI / 2
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

		let collisionAngle = false;

		if([airPoint, airPointB].some(x => x !== false))
		{
			collisionAngle = Math.atan2(airPoint[1] - airPointB[1], airPoint[0] - airPointB[0])
		}

		if(this.public.ySpeed < 0 && upDistance !== false)
		{
			this.args.ignore = 1;

			this.args.y -= (Math.floor(upDistance - (upMargin)));
			this.args.ySpeed = 0;

			blockers = this.getMapSolidAt(this.x, this.y);

			if(Array.isArray(blockers) && !this.public.flying)
			{
				const stickers = blockers.filter(a => a.canStick);

				if(this.willStick && this.willStick !== 2 && stickers.length)
				{
					this.args.gSpeed = Math.floor(-xSpeedOriginal);
					this.args.mode = MODE_CEILING;
					this.args.falling = false;
				}
			}
			else if(this.willStick && this.willStick !== 2 && !this.public.flying)
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
			const angleIsStickable = Math.abs(collisionAngle) > Math.PI / 4;

			const isLeft  = angleIsStickable && xSpeedOriginal < 0;
			const isRight = angleIsStickable && xSpeedOriginal > 0;

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

			if(this.willStick)
			{
				if(!this.getMapSolidAt(this.x - direction, this.y)
					&& !this.getMapSolidAt(this.x, this.y + 1)
					&& !this.getMapSolidAt(this.x - direction, this.y - this.public.height)
				){
					let canStick = true;

					if(Array.isArray(blockers))
					{
						canStick = blockers.filter(a => a.canStick).length;
					}

					if(canStick && isLeft)
					{
						this.args.gSpeed = Math.floor(airSpeed) * Math.sign(ySpeedOriginal);
						this.args.gSpeed = 0.1;
						this.args.mode   = MODE_LEFT;

						this.args.groundAngle = 0;
					}
					else if(canStick && isRight)
					{
						this.args.gSpeed = Math.floor(airSpeed) * -Math.sign(ySpeedOriginal);
						this.args.gSpeed = 0.1;
						this.args.mode   = MODE_RIGHT;

						this.args.groundAngle = 0;
					}
					else if(canStick)
					{
						this.args.mode = MODE_FLOOR;
					}
				}
				else
				{
					this.args.ySpeed = 0;
					this.args.xSpeed = 0;

					this.args.x -= xSpeedOriginal;
				}
			}

			const halfWidth    = Math.floor(this.public.width / 2);

			const backPosition = this.findNextStep(-2);
			const forePosition = this.findNextStep(2);
			const sensorSpread = 5;

			if(forePosition && backPosition)
			{
				const newAngle = Number(Math.atan2(forePosition[1] - backPosition[1], sensorSpread+1).toFixed(1));

				if(isNaN(newAngle))
				{
					console.log(newAngle);

					throw new Error('angle is NAN!');
				}

				this.args.angle = this.args.groundAngle = newAngle;

				if(1 /*forePosition[3] !== true && backPosition[3] !== true*/)
				{
					// this.lastAngles.unshift(newAngle);
					// this.lastAngles.splice(this.angleAvg);

					const invert = this.public.mode === MODE_FLOOR ? -1 : 1;

					const slopeDir = invert * Math.sign(this.args.groundAngle);

					let gSpeed = 0;

					if(Math.abs(slopeDir) > 0)
					{
						gSpeed += ySpeedOriginal * slopeDir;
					}

					if(xSpeedOriginal)
					{
						gSpeed += xSpeedOriginal;
					}

					if(blockers.length)
					{
						gSpeed = 0;
					}

					if(gSpeed)
					{
						this.args.gSpeed = gSpeed;
					}

				}

				if(Math.abs(this.public.gSpeed) < 1)
				{
					this.args.gSpeed = Math.sign(this.public.gSpeed);
				}

				this.args.falling = false;
			}
		}
		else if(this.public.ySpeed > 0)
		{
			if(this.args.mode === MODE_LEFT || this.args.mode === MODE_RIGHT)
			{
				const direction = this.args.mode === MODE_LEFT ? -1 : 1;

				this.args.direction = direction;

				this.args.groundAngle = Math.PI / 2 * direction;
			}

			this.args.mode = MODE_FLOOR;

			if(xSpeedOriginal)
			{
				this.args.gSpeed = Math.floor(xSpeedOriginal);
			}

			if(airPoint && collisionAngle !== false && (isNaN(collisionAngle) ||collisionAngle < Math.PI / 2))
			{
				this.args.x = Number(airPoint[0]);
				this.args.y = Number(airPoint[1]);
			}
		}

		if(!tileMap.getSolid(this.x + (this.public.width / 2) * Math.sign(this.args.xSpeed), this.y, this.public.layer))
		{
			if(Math.abs(this.public.xSpeed) > this.public.xSpeedMax)
			{
				this.args.xSpeed = this.public.xSpeedMax * Math.sign(this.public.xSpeed);
			}

			if(Math.abs(this.public.ySpeed) > this.public.ySpeedMax)
			{
				this.args.ySpeed = this.public.ySpeedMax * Math.sign(this.public.ySpeed);
			}
		}

		if(airPoint === false)
		{
			if(this.public.xSpeed)
			{
				this.args.x += this.public.xSpeed;
			}

			if(this.public.ySpeed)
			{
				this.args.y += this.public.ySpeed;
			}
		}

		if(this.args.standingOn)
		{
			const groundTop = this.args.standingOn.y - this.args.standingOn.args.height;

			if(this.y < groundTop || this.args.ySpeed < 0)
			{
				this.args.standingOn = null;
			}
		}
	}

	checkDropDash()
	{
		if(this.dropDashCharge && this.args.mode === MODE_FLOOR)
		{
			const dropBoost = this.dropDashCharge * Math.sign(this.public.xSpeed || this.public.direction);

			this.dropDashCharge = 0;

			this.onNextFrame(()=>this.args.gSpeed += dropBoost);

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
	}

	setCameraMode()
	{
		if(this.args.standingOn && this.args.standingOn.isVehicle)
		{
			this.args.cameraMode = this.args.standingOn.public.cameraMode;
		}
		else if(this.controllable)
		{
			if(!this.public.falling || this.getMapSolidAt(this.x, this.y + 24))
			{
				const forwardSolid = this.getMapSolidAt(this.x + 32 * this.public.direction, this.y + 24);
				const forwardDeepSolid = this.getMapSolidAt(this.x + 32 * this.public.direction, this.y + 96);
				const underSolid   = this.getMapSolidAt(this.x + 0  * this.public.direction, this.y + 48);

				if(this.public.mode === MODE_FLOOR && this.public.groundAngle === 0)
				{
					if(!underSolid && forwardSolid)
					{
						this.args.cameraMode = 'bridge';
					}
					else if(!forwardDeepSolid)
					{
						this.args.cameraMode = 'cliff';
					}
					else
					{
						this.args.cameraMode = 'normal';
					}
				}
				else
				{
					this.args.cameraMode = 'normal';
				}
			}
			else
			{
				if(this.getMapSolidAt(this.x + 0  * this.public.direction, this.y + 64))
				{
					this.args.cameraMode = 'normal';
				}
				else
				{
					this.args.cameraMode = 'aerial';
				}

				this.viewport.onFrameOut(45, () => {

					if(this.args.cameraMode === 'airplane')
					{
						return;
					}

					if(this.public.falling
						&& Math.abs(this.public.xSpeed > 25)
						&& !this.getMapSolidAt(this.x, this.y +480)
					){
						this.args.cameraMode = 'airplane'
					}
				});
			}
		}
	}

	callCollideHandler(other)
	{
		if(this.isGhost)
		{
			return;
		}

		let type;

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
		else
		{
			this.args.collType = 'collision-intersect';

			type = -1;

			this.solid && this.popOut(other);
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

		this.collideB(other, type %4);
		other.collideB(this, (type + 2) % 4);

		const result = this.collideA(other, type) || other.collideA(this, (type + 2) % 4);

		this.args.colliding = this.colliding = (this.colliding || result || false);

		return result;
	}

	resolveIntersection()
	{
		let backAngle = this.args.airAngle + Math.PI;

		let iterations = 0;

		if(this.getMapSolidAt(this.x, this.y, false))
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

				b = this.getMapSolidAt(testX, testY, false);

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

				testX += Math.cos(backAngle);
				testY += Math.sin(backAngle);

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
					// this.args.falling = false;

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

					// this.lastAngles.unshift(newAngle);
					// this.lastAngles.splice(this.angleAvg);

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
			&& this === Bindable.make(this.args.standingOn.occupant)
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
				this.viewport.onFrameOut(5, ()=>{
					if(Math.abs(this.public.gSpeed) < 0.01)
					{
						this.args.rolling = false
					}
				});

				this.public.gSpeed = 0;
			}
			else if(this.canRoll && this.yAxis > 0)
			{
				this.args.rolling = true;
			}
		}

		const drag = this.getLocalDrag();

		if(!this.public.falling)
		{
			if(!this.args.ignore && xAxis && !this.public.rolling)
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
			if(!this.args.ignore && Math.abs(this.public.xSpeed) < this.args.flySpeedMax)
			{
				this.args.xSpeed += xAxis * this.public.airAccel * drag;
			}

			const tileMap = this.viewport.tileMap;

			if(tileMap.getSolid(this.x + (this.public.width / 2) * Math.sign(this.args.xSpeed), this.y, this.public.layer))
			{
				this.args.xSpeed = 0;
			}
		}

		if(xAxis < 0)
		{
			if(!this.public.climbing && !this.args.ignore)
			{
				this.args.facing = 'left';
			}

			this.args.direction = -1;
		}

		if(xAxis > 0)
		{
			if(!this.public.climbing && !this.args.ignore)
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

					const regions = this.viewport.regionsAtPoint(point[0], point[1]);

					for(const region of regions)
					{
						if(this.public.mode === MODE_FLOOR
							&& point[1] === 1 + region.y + -region.public.height
							&& Math.abs(this.public.gSpeed) >= region.skimSpeed
						){
							return i;
						}
					}

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

			const downDiff = prevDown - downFirstSolid;

			if(Math.abs(downDiff) >= maxStep)
			{
				return [false, false, downDiff < 0 , downDiff > 0];
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

						const regions = this.viewport.regionsAtPoint(point[0], point[1]);

						for(const region of regions)
						{
							if(this.public.mode !== MODE_FLOOR
								|| point[1] !== 1 + region.y + -region.public.height
								|| Math.abs(this.public.gSpeed) < region.skimSpeed
							){
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
						}

						if(!regions.size)
						{
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

		const tileMap = this.viewport.tileMap;

		if(tileMap.getSolid(this.x + (this.public.width / 2) * Math.sign(this.args.xSpeed), this.y, this.public.layer))
		{
			// if(tileMap.getSolid(this.x + (1 + this.public.width / 2) * Math.sign(this.args.xSpeed), this.y, this.public.layer))
			// {
			// 	this.args.x -= 2 * Math.sign(this.args.xSpeed);
			// }

			this.args.xSpeed = 0;
		}

		this.args.rolling = false;

		this.args.mode = MODE_FLOOR;

		this.args.groundAngle = 0;
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

	startle()
	{
		if(this.args.ySpeed >= 0)
		{
			this.args.ySpeed = -4;
		}
		else
		{
			this.args.ySpeed -= 4;
		}

		this.args.standingOn = false;

		this.args.gSpeed = 0;

		this.args.xSpeed = -1 * Math.sign(this.public.xSpeed || this.public.gSpeed);

		this.args.falling = true;
	}

	scanForward(speed, height = 0.5, scanActors = true)
	{
		const dir      = Math.sign(speed);
		const radius   = Math.round(this.public.width / 2);
		const hRadius  = Math.round(this.public.height / 2);
		const scanDist = Math.ceil(Math.abs(speed));
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
				? this.public.airAngle
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
		if(!this.public.falling && this.public.standingOn)
		{
			return this.public.standingOn.realAngle;
		}

		const groundAngle = Number(this.public.groundAngle);

		// if(this.public.falling)
		// {
		// 	return -groundAngle - (Math.PI);
		// }

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
	get canFly() { return false; }
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
					if(this.args.currentSheild && press in this.args.currentSheild)
					{
						this.args.currentSheild[press](this, button);
					}

					this[press] && this[press]( button );
				}
				else if(button.delta === -1)
				{
					if(this.args.currentSheild && release in this.args.currentSheild)
					{
						this.args.currentSheild[release](this, button);
					}

					this[release] && this[release]( button );
				}
				else if(button.active)
				{
					if(this.args.currentSheild && hold in this.args.currentSheild)
					{
						this.args.currentSheild[hold](this, button);
					}

					this[hold] && this[hold]( button );
				}
			}
			else if(this.args.standingOn && this.args.standingOn.isVehicle)
			{
				this.args.jumping = false;

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
			if(this.args.standingOn && this.args.standingOn.isVehicle)
			{
				this.willJump = true;
			}

			return;
		}

		if(!this.willJump)
		{
			if(this.yAxis < 0)
			{
				this.args.standingOn = false;
			}

			this.willJump = true;
		}
	}

	command_1()
	{
		if(this.canRoll && this.public.gSpeed)
		{
			this.args.rolling = true;
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

		// if(!this.pincherFg)
		// {
		// 	const filterContainer = this.viewport.tags.fgFilters;

		// 	const type = this.args.type.split(' ').shift();
		// 	const html = `<div class = "point-actor-filter pinch-filter">`;

		// 	this.pinchFilterFg = new Tag(html);

		// 	filterContainer.appendChild(this.pinchFilterFg.node);

		// 	this.pincherFg = new Pinch({id: 'pinch-fg-' + this.args.id, scale: 60});

		// 	this.pincherFg.args.bindTo(['x', 'y', 'width', 'height', 'xOff', 'yOff'], (v,k) => {
		// 		this.pinchFilterFg.style({
		// 			[`--${k}`]: v, filter: `url(#pinch-fg-${this.args.id})`
		// 		});
		// 	});

		// 	this.args.yOff = 16;

		// 	this.pincherFg.render(this.sprite);
		// }

		// this.pincherFg.args.scale = warpFg;
	}

	droop(warpFactor = 0, xPosition = 0)
	{
		const half = this.public.width / 2;

		if(!this.drooperFg)
		{
			// const filterContainer = this.viewport.tags.bgFilters;

			// const type = this.args.type.split(' ').shift();
			// const html = `<div class = "point-actor-filter droop-filter">`;

			// this.droopFilterFg = new Tag(html);

			this.drooperFg = new Droop({
				id: 'droop-' + this.args.id
				, width: this.public.width * 3
				, height: this.public.height * 3
				, scale: 64
			});

			// filterContainer.appendChild(this.droopFilterFg.node);

			this.args.bindTo(['x', 'y'], (v,k) => {
				this.drooperFg.args[k] = Number(v).toFixed(2);
			});

			// this.args.yOff = 16;

			this.onNextFrame(() => {
				this.drooperFg.args.scale = Number(warpFactor * 2).toFixed(2);

				this.sprite.style({
					transform: `translate(-50%, calc(${warpFactor}px + calc(-100% + 1px)))`
					, filter:  `url(#droop-${this.args.id})`
				});

				this.drooperFg.args.dx = -xPosition;

				// this.drooperFg.args.intensity = 1 - (Math.abs(xPosition) / Math.abs(half))
			});

			this.drooperFg.render(this.sprite);

			return;
		}

		this.drooperFg.args.scale = Number(warpFactor * 2).toFixed(2);

		this.sprite.style({
			transform: `translate(-50%, calc(${warpFactor}px + calc(-100% + 1px)))`
			, filter:  `url(#droop-${this.args.id})`
		});

		this.drooperFg.args.dx = -xPosition;

		// this.drooperFg.args.intensity = 1 - (Math.abs(xPosition) / Math.abs(half))
	}

	crossRegionBoundary(region)
	{
		if(!region)
		{
			return;
		}

		const drag = region.args.drag;

		this.args.xSpeed *= drag;
		this.args.ySpeed *= drag;
		this.args.gSpeed *= drag;

		if(this.viewport)
		{
			const viewport = this.viewport;

			if(!this.args.gone && region.entryParticle)
			{
				const splash = new Tag(region.entryParticle);

				if(splash.node)
				{
					splash.style({
						'--x': this.x, '--y': region.y + -region.args.height + -8
						, 'z-index': 5, opacity: Math.random
						, '--particleScale': this.args.particleScale
						, '--time': 320
					});

					viewport.particles.add(splash);

					setTimeout(() => splash.node && viewport.particles.remove(splash), 320);
				}
			}
		}
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

	get facePoint()
	{
		return this.rotatePoint(
			-5 * this.public.direction
			, -14 + this.public.height
		);
	}
}
