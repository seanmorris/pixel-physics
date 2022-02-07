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
import { SuperSheild }     from '../powerups/SuperSheild';
import { BubbleSheild }   from '../powerups/BubbleSheild';
import { ElectricSheild } from '../powerups/ElectricSheild';

import { LayerSwitch } from './LayerSwitch';
import { Layer } from '../viewport/Layer';

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

	template = `<div class  = "point-actor [[type]]">
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

	// ringDoc = new DocumentFragment;

	static fromDef(objDef)
	{
		const objArgs = {
			x:         objDef.x + Math.floor(objDef.width / 2)
			, y:       objDef.y - 1
			// , z:       objDef.id
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

		objArgs.tileId = objDef.gid;

		const instance =  new this(Object.assign({}, objArgs));

		instance.def = def;

		instance.args.float = instance.float ?? instance.args.float;

		return instance;
	}

	constructor(args = {}, parent)
	{
		args[ Bindable.NoGetters ] = true;

		super(args, parent);

		this[ Bindable.NoGetters ] = true;

		this.defaultDisplay = 'initial';

		this.springing = false;

		this.stepCache = {};

		this.fallTime  = 0;

		this.args.weight = this.args.weight ?? 100;
		this.args.score  = 0;
		this.args.rings  = 0;

		this.args.mercy = false;

		this.args.opacity = 1;
		this.args.pushing = false;

		this.autoStyle = new Map;
		this.autoAttr  = new Map;
		this.hanging   = new Map;
		this.ignores   = new Map;

		this.regions   = new Set;
		this.powerups  = new Set;
		this.behaviors = new Set;

		this.lastPointA = [];
		this.lastPointB = [];

		this.inventory = new Classifier([
			Sheild
			, FireSheild
			, BubbleSheild
			, ElectricSheild
		]);

		this.noClip = false;

		this.sheild = null;

		this.inventory.addEventListener('adding', event => {

			const item = event.detail.object;

			if(this.inventory.has(item.constructor))
			{
				event.preventDefault();
				return;
			}

			this.powerups.add(item);

			item.acquire && item.acquire(this);

			this.args.currentSheild = item;

			item.equip && item.equip(this);
		});

		this.inventory.addEventListener('removing', event => {
			const item = event.detail.object;
			this.powerups.delete(item);

			if(Bindable.make(item) === this.args.currentSheild)
			{
				this.args.currentSheild = null;
			}
		});

		this.args.bindTo('currentSheild', (v,k,t,d,p) => {

			if(p)
			{
				p.unequip && p.unequip(this);
			}

			for(const shield of this.inventory.get(Sheild))
			{
				if(shield instanceof SuperSheild)
				{
					continue;
				}

				shield.detach();
			}

			v && v.equip && v.equip(this);

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

		this.ringSet = new Set;
		this.ringDoc = new DocumentFragment;

		this.args.yMargin = 0;

		this.args.cameraMode = 'normal';
		this.args.cameraBias = 0;

		this.args.layer = 1;
		this.args.moving = false;
		this.args.active = false;

		this.args.flySpeedMax = 40;

		this.args.x = this.args.x || 1024 + 256;
		this.args.y = this.args.y || 32;
		this.args.z = this.args.z || 0;

		this.args.xOff = 0;
		this.args.yOff = 0;

		this.args.width  = this.args.width  || 1;
		this.args.height = this.args.height || 1;

		this.args.direction = Number(this.args.direction) || 1;

		this.args.gSpeed = this.args.gSpeed || 0;
		this.args.hSpeed = 0;
		this.args.xSpeed = this.args.xSpeed || 0;
		this.args.ySpeed = this.args.ySpeed || 0;
		this.args.angle  = this.args.angle  || 0;

		this.args.groundAngle  = this.args.groundAngle || 0;
		this.args.displayAngle = 0;
		this.args.airAngle     = 0;

		this.lastAngles = [];
		this.angleAvg   = 16;

		this.args.xSpeedMax = 512;
		this.args.ySpeedMax = 512;
		this.args.gSpeedMax    = WALKING_SPEED;
		this.args.rollSpeedMax = 23;
		this.args.gravity   = 0.65;
		this.args.decel     = 0.85;
		this.args.accel     = 0.2;
		this.args.airAccel  = 0.3;
		this.args.jumpForce = 14;

		this.args.jumping  = false;
		this.args.jumpedAt = null;
		this.args.deepJump = false;
		this.args.highJump = false;

		this.maxStep   = 8;
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

		this.args.mode = this.args.mode || MODE_FLOOR;

		this.xAxis = 0;
		this.yAxis = 0;
		this.aAxis = 0;
		this.bAxis = 0;
		this.lAxis = 0;
		this.rAxis = 0;

		this.buttons = {};

		this.willStick = false;
		this.stayStuck = false;

		this.args.startled = this.args.startled || 0;
		this.args.halted = this.args.halted || 0;
		this.args.ignore = this.args.ignore || 0;
		this.args.float  = this.args.float  || 0;

		this.colliding = false;

		this.args.flyAngle = 0;

		this.args.bindTo(['x','y'], (v, k, t) => {
			isNaN(v) && console.trace(k, v)
			this.stepCache = {};
			this.args.idleTime = 0;
		});

		this.args.bindTo('gSpeed', v => {
			this.gSpeedLast = v || this.gSpeedLast;
		});

		this.args.bindTo('xSpeed', v => {
			this.airAngle = this.args.airAngle = Math.atan2(this.args.ySpeed, v)
			this.xSpeedLast = v || this.xSpeedLast;
		});
		this.args.bindTo('ySpeed', v => {
			this.airAngle = this.args.airAngle = Math.atan2(v, this.args.xSpeed)
			this.ySpeedLast = v || this.ySpeedLast;
		});

		// this.controllable && this.args.bindTo('animation', v => console.trace(v));
		// this.controllable && this.args.bindTo('xSpeed', v => console.trace(v));
		// this.controllable && this.args.bindTo('ySpeed', v => console.trace(v));
		// this.controllable && this.args.bindTo('gSpeed', v => console.trace(v));
		// this.controllable && this.args.bindTo('falling', v => console.trace(v));

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
				new CharacterString({value: this.args.name})
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

			if(this.isGhost)
			{
				return;
			}

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

				prevGroundObject.args.active = false;
			}

			if(!groundObject)
			{
				return;
			}

			if(this.controllable && groundObject.isVehicle)
			{
				this.args.pushing = false;

				groundObject.args.active = true;

				const debindGroundX = groundObject.args.bindTo('x', (vv,kk) => {
					const x = groundObject.args.direction * groundObject.args.seatForward || 0;
					const y = groundObject.args.seatHeight || groundObject.args.height || 0;

					// const xRot = x * Math.cos(groundObject.realAngle) - y * Math.sin(groundObject.realAngle);
					// const yRot = y * Math.cos(groundObject.realAngle) + x * Math.sin(groundObject.realAngle);

					const [xRot, yRot] = groundObject.rotatePoint(x, y);

					this.args.x = xRot + vv;
					this.args.y = yRot + groundObject.y;

					this.args.direction = groundObject.args.direction;
				});

				const debindGroundY = groundObject.args.bindTo('y', (vv,kk) => {

					if(this.args.jumping)
					{
						return;
					}

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
				if(this.y <= this.args.height + groundObject.y - groundObject.args.height)
				{
					const debindGroundX = groundObject.args.bindTo('x', (vv,kk) => {
						this.args.x += vv + -groundObject.args.x
					});

					const debindGroundY = groundObject.args.bindTo('y', (vv,kk) => {
						this.args.y = vv + -groundObject.args.height
							+ ((this.controllable || this.isPushable) ? 0 : 0);
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
		if(this.init || !this.viewport)
		{
			return;
		}

		const Ring = this.viewport.objectPalette.ring;

		if(this.controllable)
		{
			this.args.bindTo('rings', v => {

				if(!v)
				{
					return;
				}

				window.requestIdleCallback(() => {
					if(this.ringSet.size < v)
					{
						const ring = new Ring;

						ring.viewport = this.viewport;

						ring.render(this.ringDoc);

						this.ringSet.add(ring);
					}
				});
			});
		}


		const regionClass = this.viewport.objectPalette['base-region']

		this.isRegion = this instanceof regionClass;

		this.box = this.findTag('div');

		this.autoStyle.set(this.box, {
			display:              'display'
			, '--animation-bias': 'animationBias'
			, '--bg-filter':      'bgFilter'
			, '--sprite-sheet':   'spriteSheetUrl'
			, '--direction'   :   'direction'
			, '--sprite-x':       'spriteX'
			, '--sprite-y':       'spriteY'
			, '--angle':          'angle'
			, '--palletShift':    'palletShift'
			, '--fly-angle':      'flyAngle'
			, '--display-angle':  'groundAngle'
			, '--ground-angle':   'groundAngle'
			, '--air-angle':      'airAngle'
			, '--opacity':        'opacity'
			, '--height':         'height'
			, '--width':          'width'
			, '--x':              'x'
			, '--y':              'y'
			, '--z':              'z'
		});

		this.autoAttr.set(this.box, {
			'data-camera-mode': 'cameraMode'
			, 'data-colliding': 'colliding'
			, 'data-respawning':'respawning'
			, 'data-mercy':     'mercy'
			, 'data-selected':  'selected'
			, 'data-falling':   'falling'
			, 'data-moving':    'moving'
			, 'data-pushing':   'pushing'
			, 'data-facing':    'facing'
			, 'data-filter':    'filter'
			, 'data-angle':     'angleDeg'
			, 'data-active':    'active'
			, 'data-layer':     'layer'
			, 'data-mode':      'mode'
			, 'data-id':        'id'
		});

		// data-camera-mode = "[[cameraMode]]"
		// data-colliding   = "[[colliding]]"
		// data-falling     = "[[falling]]"
		// data-facing      = "[[facing]]"
		// data-filter      = "[[filter]]"
		// data-angle       = "[[angle|rad2deg]]"
		// data-layer       = "[[layer]]"
		// data-mode        = "[[mode]]"
		// data-id          = "[[id]]"

		this.args.bindTo('spriteSheet', v => this.args.spriteSheetUrl = this.urlWrap(v));
		this.args.bindTo('angle', v => this.args.angleDeg = this.rad2deg(v));

		this.sprite = this.findTag('div.sprite');

		if(this.controllable)
		{
			const superSheild = new SuperSheild;

			superSheild.equip(this);

			this.inventory.add(superSheild);
		}

		this.init = true;

		this.args.bindTo('animation', v => this.box.setAttribute('data-animation', v));
		this.bindTo('isSuper',  v => this.box.setAttribute('data-super', v));
		this.bindTo('isHyper',  v => this.box.setAttribute('data-hyper', v));

		if(this.controllable)
		{
			this.sprite.parentNode.classList.add('controllable');
		}

		this.listen('click', ()=>{

			const now = Date.now();

			const timeSince = now - PointActor.lastClick;

			if(!this.controllable)
			{
				return;
			}

			if(Bindable.make(this) === this.viewport.controlActor)
			{
				return;
			}

			if(timeSince < 1000)
			{
				this.viewport.auras.add(this);

				const clear = this.viewport.onFrameInterval(1, () => {

					const frame = this.viewport.serializePlayer();

					this.viewport.onFrameOut(5, () => {

						if(frame.input)
						{
							this.controller && this.controller.replay(frame.input);
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

			if(this.viewport.tags.currentActor)
			{
				for(const option of this.viewport.tags.currentActor.options)
				{
					if(option.value === this.args.name)
					{
						this.viewport.tags.currentActor.value = option.value;
					}
				}
			}
		});
	}

	updateStart()
	{
		this.lastLayer = null;

		this.args.localCameraMode = null;

		if(this.args.dead)
		{
			return;
		}

		if(this.args.standingLayer && !this.args.static)
		{
			const layer = this.args.standingLayer.layer;

			let grindRegion = false;

			for(const region of this.regions)
			{
				if(region.grind)
				{
					grindRegion = true;
				}
			}

			if(!this.controllable)
			{
				this.args.grinding = false;
			}
			else if(layer && layer.meta.grinding)
			{
				this.args.grinding = true;
				this.args.direction = Math.sign(this.args.xSpeed || this.args.gSpeed);
			}
			else if(!grindRegion)
			{
				this.args.grinding = false;
			}

			if(this.args.grinding && this.args.falling)
			{
				this.args.grinding = false;
			}
		}
	}

	updateEnd()
	{
		if(!this.args.static && this.args.falling)
		{
			if(this.args.standingLayer)
			{
				this.args.xSpeed += this.args.standingLayer.offsetXChanged;
				this.args.ySpeed += this.args.standingLayer.offsetYChanged;
			}

			this.args.standingLayer = null;
		}

		for(const [tag, cssArgs] of this.autoStyle)
		{
			const styles = {};

			for(const [prop, arg] of Object.entries(cssArgs))
			{
				if(arg in this.args)
				{
					styles[ prop ] = this.args[ arg ];
				}
			}

			tag.style(styles);
		}

		for(const [tag, attrsArgs] of this.autoAttr)
		{
			const attrs = {};

			for(const [attr, arg] of Object.entries(attrsArgs))
			{
				if(arg in this.args)
				{
					attrs[ attr ] = this.args[ arg ];
				}

			}

			tag.attr(attrs);
		}
	}

	update()
	{
		if(typeof this.args.standingOn === 'number')
		{
			const standId = this.args.standingOn;
			const standOn = this.viewport.actorsById[standId];

			if(standOn)
			{
				this.args.standingOn = standOn;

				this.args.x = standOn.x;
				this.args.y = standOn.y - standOn.args.height;
			}
		}

		if(this.viewport)
		{
			this.age = this.viewport.args.frameId - this.startFrame
		}

		if(this.args.rolling)
		{
			this.args.pushing = false;
		}

		const startX = this.x;
		const startY = this.y;

		if(this.noClip && !this.controllable)
		{
			if(this.args.xSpeed)
			{
				this.args.x += this.args.xSpeed;
			}

			if(this.args.ySpeed)
			{
				this.args.y += this.args.ySpeed;
			}

			if(!this.args.float && this.args.falling)
			{
				this.args.ySpeed += this.args.gravity;
			}

			if(this.args.float > 0)
			{
				this.args.float--;
			}

			const collisions = viewport.actorsAtPoint(this.args.x, this.args.y, this.args.width, this.args.height);

			if(collisions)
			{
				for(const actor of collisions)
				{
					if(actor.args === this.args)
					{
						continue;
					}

					actor.callCollideHandler(this);
				}
			}

			return;
		}

		if(!this.args.falling && !this.args.rolling)
		{
			this.args.spinning = false;
		}

		if(this.args.rolling || this.args.jumping)
		{
			this.args.spinning = true;
		}

		if(this.viewport
			&& this.args.respawning
			&& !this.viewport.args.isRecording
			&& !this.viewport.args.isReplaying
		){
			const stored = this.viewport.getCheckpoint(this.args.id);

			let toX, toY;

			if(stored && stored.checkpointId)
			{
				const checkpoint = this.viewport.actorsById[ stored.checkpointId ];

				toX = checkpoint.x;
				toY = checkpoint.y;
			}
			else if(this.def)
			{
				toX = this.def.get('x');
				toY = this.def.get('y');
			}

			this.args.standingLayer = null;
			this.args.standingOn    = null;
			this.lastLayer = null;

			const xDiff = this.args.x - toX;
			const yDiff = this.args.y - toY;

			const xPanSpeed = Math.max(Math.abs((xDiff / 8)), 16);
			const yPanSpeed = Math.max(Math.abs((yDiff / 8)), 16);

			this.args.x -= Math.sign(xDiff) * xPanSpeed;
			this.args.y -= Math.sign(yDiff) * yPanSpeed;

			if(Math.abs(xDiff) <= xPanSpeed && Math.abs(yDiff) <= yPanSpeed)
			{
				this.args.dead = false;
				this.noClip = false;
				this.args.respawning = false;
				this.args.display    = 'initial';
				this.args.x = toX;
				this.args.y = toY;
				this.args.ignore = this.args.ignore || 4;

				const viewport = this.viewport;

				viewport.reset();
				viewport.startLevel(false);

				viewport.args.paused = false;

				return;
			}

			this.viewport && this.viewport.setColCell(this);

			return;
		}

		if(this.viewport
			&& this.viewport.meta.deathLine
			&& !this.args.dead
			&& this.controllable
			&& this.y > this.viewport.meta.deathLine
		){
			this.die();
			return;
		}

		if(this.controllable && !this.args.dead)
		{
			const radius = 0.5 * this.args.width;
			const direction = Math.sign(this.args.xSpeed);
			const height = Math.max(this.args.height, 0);

			const headPoint = this.rotatePoint(0, height * 0.75);
			// const headPoint = this.rotatePoint(radius * -direction, this.args.height * 0.75);

			let jumpBlock = this.getMapSolidAt(this.x + headPoint[0], this.y + headPoint[1]);

			if(Array.isArray(jumpBlock))
			{
				jumpBlock = !!jumpBlock.filter(a => !a.args.platform && !a.isVehicle).length;
			}

			if(!this.args.falling && this.checkBelow(this.x, this.y) && jumpBlock)
			{
				this.die();

				return;
			}

			if(!this.args.falling && this.args.mode === 0)
			{
				const upFirstSpace = this.castRay(
					this.maxStep
					, this.upAngle
					, this.findUpSpace
				);

				if(upFirstSpace)
				{
					this.args.y -= upFirstSpace;
				}
			}
		}

		for(const [object, timeout] of this.ignores)
		{
			if(timeout <= 0)
			{
				this.ignores.delete(object);
			}
			else
			{
				this.ignores.set(object, -1 + timeout);
			}
		}

		this.args.skimming = false;

		if(this.args.falling)
		{
			this.args.airAngle = this.airAngle;

			if(this.args.displayAngle !== this.args.groundAngle)
			{
				const angleDiff = this.args.groundAngle + -this.args.displayAngle;

				this.args.displayAngle +=
					Math.sign(angleDiff)
					* (Math.abs(angleDiff) > 1 ? 1 : Math.abs(angleDiff))
					* 0.5;
			}
		}
		else
		{
			this.args.airAngle = 0;

			this.args.displayAngle = this.args.groundAngle;
		}

		if(this.args.halted < 1 && this.args.halted > 0)
		{
			this.args.halted = 0;
		}

		if(this.args.halted > 0)
		{
			this.args.halted--;

			return;
		}

		if(this.args.currentSheild && 'update' in this.args.currentSheild)
		{
			this.args.currentSheild.update(this);
		}

		if(this.args.rolling)
		{
			this.args.height = this.args.rollingHeight || this.args.height;
		}
		else if(this.args.jumping)
		{
			this.args.height = this.args.rollingHeight || this.args.height;
		}
		else if(this.canRoll)
		{
			this.args.height = this.args.normalHeight || this.args.height;
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

		if(!this.args.falling)
		{
			if(Math.abs(this.args.gSpeed) < 1 && !this.impulseMag && this.args.modeTime > 3)
			{
				this.args.rolling = false
			}

			if(Math.abs(this.args.gSpeed) < 0.01)
			{
				this.args.gSpeed = 0;
			}
			else if(this.canRoll && this.yAxis > 0.55 && !this.args.ignore)
			{
				this.args.rolling = true;
			}
		}

		if(this.args.standingOn && this.args.standingOn.isVehicle && !this.isVehicle)
		{
			const vehicle = this.args.standingOn;

			this.args.falling = true;
			this.args.flying  = false;
			this.args.jumping = false;

			this.processInput();

			this.args.cameraMode = vehicle.args.cameraMode;

			if(this.willJump && this.yAxis < 0)
			{
				const leaving = this.args.standingOn;

				this.args.standingLayer = false;
				this.args.standingOn = false;
				this.willJump   = false;

				leaving.occupant = null;

				this.args.falling = true;
				this.args.jumping = true;

				// this.args.y -= vehicle.args.seatHeight || vehicle.args.height;
				this.args.y -= 16;

				this.args.xSpeed = vehicle.args.direction * 2 * -Math.sign(vehicle.args.seatAngle || -1);
				this.args.ySpeed = -this.args.jumpForce;
				vehicle.args.ySpeed = 0;
			}

			this.args.groundAngle = (vehicle.args.groundAngle || 0) + (vehicle.args.seatAngle || 0);

			if(this.willJump && this.yAxis >= 0)
			{
				this.args.standingOn.falling = false;
				this.willJump = false;

				this.args.standingOn.command_0();
			}

			return;
		}

		if(this.impulseMag !== null)
		{
			this.args.xSpeed += Number(Number(Math.cos(this.impulseDir) * this.impulseMag).toFixed(3));
			this.args.ySpeed += Number(Number(Math.sin(this.impulseDir) * this.impulseMag).toFixed(3));

			if(!this.impulseFal)
			{
				switch(this.args.mode)
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
				this.args.falling = this.impulseFal || this.args.falling;
			}

			this.impulseMag   = null;
			this.impulseDir   = null;
			this.impulseFal   = null;
		}

		if(this.args.ignore === -2 && (this.args.falling === false || this.args.ySpeed > 64))
		{
			this.args.ignore = 0;
		}

		if(this.args.ignore === -3 && (!this.args.falling || this.args.ySpeed >= 0))
		{
			this.onNextFrame(() => this.args.ignore = 0);
		}

		if(this.args.ignore < 1 && this.args.ignore > 0)
		{
			this.args.ignore = 0;
		}

		if(this.args.ignore > 0)
		{
			this.args.ignore--;
		}

		if(this.args.startled > 0)
		{
			this.args.startled--;
		}

		if(this.args.float > 0)
		{
			this.args.float--;
		}

		// if(this.args.standingOn instanceof PointActor)
		// {
		// 	this.args.standingOn.callCollideHandler(this);
		// }

		if(!this.args.float && this.args.falling)
		{
			if(!this.args.standingOn || !this.args.standingOn.isVehicle)
			{
				this.args.standingOn = null;
				this.args.landed = false;
				this.lastAngles  = [];

				if(this.args.jumping && this.args.jumpedAt < this.y)
				{
					this.args.deepJump = true;
				}
				else if(this.args.jumping && this.args.jumpedAt > this.y + 160)
				{
					this.args.highJump = true;
				}
				else if(this.args.jumping)
				{
					this.args.deepJump = false;
					this.args.highJump = false;
				}
			}
		}
		else if(this.args.jumping && !this.args.falling)
		{
			this.args.jumping  = false;
			this.args.deepJump = false;
			this.args.highJump = false;
			this.args.jumpedAt = null;
		}

		if(!this.args.falling
			&& this.args.standingOn
			&& this.args.rolling
			&& this.args.modeTime < 3
			&& !this.args.dropDashCharge
			&& this.args.standingOn.args.convey
		){
			this.args.gSpeed = -this.args.standingOn.args.convey * 0.8;
		}

		const drag = this.getLocalDrag();

		let regions = new Set;

		if(!this.noClip)
		{
			regions = this.viewport.regionsAtPoint(this.x, this.y);

			for(const region of this.regions)
			{
				region.updateActor(this);
			}
		}

		let gSpeedMax = this.args.gSpeedMax;

		if(!this.isRegion)
		{
			for(const region of this.regions)
			{
				if(!regions.has(region))
				{
					this.regions.delete(region);

					this.crossRegionBoundary(region, false);
				}
			}

			for(const region of regions)
			{
				if(this.args.density)
				{
					if(region.args.density && this.args.density < region.args.density)
					{
						const densityRatio = region.args.density / this.args.density;

						let blocked = false;

						let blockers = this.getMapSolidAt(this.x, this.y - this.args.height);

						if(Array.isArray(blockers))
						{
							blockers.filter(x => ![...regions].includes(x));

							if(blockers.length)
							{
								blocked = true;
							}
						}

						if(!blocked)
						{
							const myTop     = this.y - this.args.height;
							const regionTop = region.y - region.args.height;

							const depth = Math.min(
								(myTop + -regionTop + 4) / this.args.height
								, 1
							);

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
				}

				if(!this.regions.has(region))
				{
					this.regions.add(region);

					this.crossRegionBoundary(region, true);
				}
			}

			// if(!regions.size && this.def)
			// {
			// 	this.args.float = this.def.get('float') ?? this.args.float ?? 0;
			// }
		}

		if(this.willJump && !this.args.dontJump && (!this.args.falling || this.falltime < 2))
		{
			this.willJump = false;

			const tileMap = this.viewport.tileMap;

			const height = Math.max(this.args.height, 32);

			const headPoint = this.rotatePoint(0, height + 1);

			let jumpBlock = this.getMapSolidAt(this.x + headPoint[0], this.y + headPoint[1]);

			if(Array.isArray(jumpBlock))
			{
				jumpBlock = !!jumpBlock.filter(a => !a.args.platform && !a.isVehicle).length;
			}

			if(!jumpBlock)
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

		this.willJump = false;

		if(!this.viewport)
		{
			return;
		}

		if(this.noClip)
		{
			this.args.falling = true;
		}

		if(!this.args.static)
		{
			const regionsBelow = this.viewport.regionsAtPoint(this.groundPoint[0], this.groundPoint[1]+1);
			const standingOn = this.getMapSolidAt(...this.groundPoint);

			if(!this.isRegion && this.args.mode === MODE_FLOOR && regionsBelow.size)
			{
				let falling = !standingOn;

				for(const region of regionsBelow)
				{
					if(
						(this.broad || this.y + 1 === region.y - region.args.height || this.y + 0 === region.y - region.args.height)
						&& !this.args.falling
					){
						if(Math.max(Math.abs(this.args.gSpeed), Math.abs(this.args.xSpeed)) >= region.skimSpeed)
						{
							const speed = this.args.falling ? Math.abs(this.args.xSpeed) : Math.abs(this.args.gSpeed);

							this.args.gSpeed = speed * Math.sign(this.args.gSpeed || this.args.xSpeed);

							if(this.y - 16 < region.y - region.args.height)
							{
								this.args.skimming = true;
								this.args.y = region.y - region.args.height + -1;
								falling = false;
								region.skim(this);
							}
							else
							{
								this.args.ySpeed--;
							}

							break;
						}
						else
						{
							this.args.xSpeed = this.args.gSpeed || this.args.xSpeed;
						}
					}
				}

				this.args.standingOn = null;
				// this.args.falling = falling || this.args.falling;
				this.args.falling = falling;

				if(falling)
				{
					this.args.xSpeed = this.args.xSpeed || this.args.gSpeed;
					this.args.standingLayer = null;
				}
				else
				{
					this.args.gSpeed = this.args.gSpeed || this.args.xSpeed;
				}
			}
			else if(!this.noClip && !this.args.xSpeed && !this.args.ySpeed && !this.args.float)
			{
				this.args.falling = !this.checkBelow() || this.args.falling;
			}

			if(this.noClip || (!this.isRegion && !this.isEffect && this.args.falling && this.viewport))
			{
				if(this.args.grinding)
				{
					this.args.grinding = false;
				}

				this.args.mode = MODE_FLOOR;
				this.args.gSpeed = 0;

				this.updateAirPosition();

				this.args.animationBias = Math.abs(this.args.airSpeed / this.args.flySpeedMax);

				if(this.args.animationBias > 1)
				{
					this.args.animationBias = 1;
				}
			}
			else if(!this.noClip || this.args.standingLayer || (!this.isRegion &&!this.isEffect && !this.args.falling))
			{
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
				this.updateGroundPosition();

				this.args.animationBias = Math.abs((this.args.hSpeed * 0.75 || this.args.gSpeed) / this.args.gSpeedMax);

				if(this.args.animationBias > 1)
				{
					this.args.animationBias = 1;
				}
			}

			if(!this.viewport)
			{
				return;
			}
		}

		const halfWidth  = Math.ceil(this.args.width/2);
		const halfHeight = Math.floor(this.args.height/2);

		// if(!this.isRegion && (this.args.pushed || ( !this.willStick && this.controllable )))
		if(!this.noClip && !this.isRegion && this.args.pushed)
		{
			let block;

			const testWallPoint = (direction) => {
				switch(this.args.mode)
				{
					case MODE_FLOOR:
						block = this.getMapSolidAt(
							this.x + halfWidth * direction + (direction === -1 ? 0 : -1)
							, this.y - halfHeight
						);
						break;

					case MODE_CEILING:
						block = this.getMapSolidAt(
							this.x + halfWidth * direction + (direction === -1 ? 0 : -1)
							, this.y + halfHeight
						);
						break;

					case MODE_LEFT:
						block = this.getMapSolidAt(
							this.x + halfHeight * (direction === -1 ? 0 : 2)
							, this.y
						)
						break;

					case MODE_RIGHT:
						block = this.getMapSolidAt(
							this.x - halfHeight * (direction === -1 ? 0 : 2)
							, this.y
						);
						break;
				}

				if(block && Array.isArray(block))
				{
					return block.filter(a => !a.isVehicle);
				}

				return block;
			};

			const leftWall  = testWallPoint(-1);
			const rightWall = testWallPoint(1);

			if(rightWall && !leftWall)
			{
				if(this.args.xSpeed > 0)
				{
					this.args.xSpeed = 0;
				}

				this.args.x--;
			}

			if(leftWall && !rightWall)
			{
				if(this.args.xSpeed > 0)
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

		if(!this.isGhost && !(skipChecking.some(x => this instanceof x)))
		{
			const colls = this.viewport.actorsAtPoint(this.x, this.y, this.args.width, this.args.height)
				.filter(x => x.args !== this.args && !x.isPushable && x.callCollideHandler(this));
		}

		if(!this.viewport)
		{
			return;
		}

		const tileMap = this.viewport.tileMap;

		if(Math.abs(this.args.gSpeed) < 2 && !this.args.falling)
		{
			let stayStuck = this.stayStuck;

			this.regions.forEach(region => {
				stayStuck = stayStuck || region.args.sticky;
			});

			if(!stayStuck && !this.args.climbing)
			{
				const half = Math.floor(this.args.width / 2) || 0;

				// if(!tileMap.getSolid(this.x, this.y+1, this.args.layer))
				const mode = this.args.mode;

				if(this.args.mode === MODE_FLOOR && this.args.groundAngle <= -(Math.PI / 4))
				{
					this.args.gSpeed = 8;
				}
				else if(this.args.mode === MODE_FLOOR && this.args.groundAngle >= (Math.PI / 4) && this.args.groundAngle < Math.PI)
				{
					this.args.gSpeed = -8;
				}
				else if(mode === MODE_LEFT)
				{
					this.lastAngles = [];

					this.args.xSpeed = 2;

					this.args.mode = MODE_FLOOR
					this.args.falling = true;
					this.args.groundAngle = -Math.PI / 2;

					this.args.x += this.args.width/2;

					this.args.ignore = 30;

				}
				else if(mode === MODE_RIGHT)
				{
					this.lastAngles = [];

					this.args.xSpeed = -2;

					this.args.mode = MODE_FLOOR
					this.args.falling = true;
					this.args.groundAngle = Math.PI / 2;
					this.args.x -= this.args.width/2;

					this.args.ignore = 30;
				}
				else if(mode === MODE_CEILING)
				{
					this.lastAngles = [];

					this.args.xSpeed = 0;

					this.args.y++;
					this.args.ignore = 8;
					this.args.falling = true;
					this.willJump = false;

					const gSpeed = this.args.gSpeed;

					// this.args.groundAngle = Math.PI;
					this.args.mode = MODE_FLOOR;

					this.onNextFrame(() => {
						this.args.groundAngle = Math.PI;
						this.args.mode = MODE_FLOOR;

						this.willJump = false
						this.args.xSpeed = -gSpeed;
					});

					if(Math.sign(this.xSpeedLast) === -1)
					{
						this.args.facing = 'left'
						this.args.x++;
					}
					else if(Math.sign(this.xSpeedLast) === 1)
					{
						this.args.facing = 'right'
						this.args.x--;
					}

				}
			}
		}

		this.args.landed = true;

		if(this.controllable)
		{
			this.args.x = (this.args.x);
			this.args.y = (this.args.y);
		}

		// if(!this.noClip && !this.args.falling && !this.isRegion)
		// {
		// 	if(this.args.mode === MODE_FLOOR && !this.args.gSpeed && !this.args.xSpeed)
		// 	{
		// 		let execs = 0;

		// 		const heading = Math.atan2(startY - this.y, startX - this.x);

		// 		this.args.xSpeed = 0;
		// 		this.args.ySpeed = 0;

		// 		while(this.getMapSolidAt(this.x, this.y - 1, false))
		// 		{
		// 			this.args.x += Math.cos(heading);
		// 			this.args.y += Math.sin(heading);

		// 			if(execs++ > 1000)
		// 			{
		// 				break;
		// 			}
		// 		}
		// 	}
		// }

		// if(this.args.falling)
		// {
		// 	this.args.gSpeed = 0;
		// }

		this.controllable && this.processInput();

		if(this.args.falling || this.args.gSpeed)
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

		if(isNaN(this.args.groundAngle))
		{
			console.log(this.lastAngles, this.lastAngles.length);
		}

		if(!this.args.float && !this.args.static)
		{
			const standingOn = this.getMapSolidAt(...this.groundPoint);

			if(Array.isArray(standingOn) && standingOn.length && !this.args.float)
			{
				this.args.standingLayer = false;

				const groundActors = standingOn.filter(
					a => a.args !== this.args && a.solid && a.callCollideHandler(this)
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

						// if(groundActor.args.standingLayer)
						// {
						// 	this.args.standingLayer = groundActor.args.standingLayer;
						// }
					}
				}
			}
			else if(standingOn)
			{
				this.args.standingOn = null;

				if(typeof standingOn === 'object')
				{
					this.args.standingLayer = standingOn;
				}
				else
				{
					this.args.standingLayer = null;
				}
			}
			else
			{
				this.args.standingOn = null;
			}
		}

		if(this.args.falling && this.args.ySpeed < this.args.ySpeedMax)
		{
			if(!this.args.float)
			{
				let gravity = 1;

				for(const region of this.regions)
				{
					if(!region.args.gravity && region.args.gravity !== 1)
					{
						continue;
					}

					gravity *= region.args.gravity;
				}

				this.args.ySpeed += this.args.gravity * gravity;
			}

			this.args.landed = false;
		}

		if(!this.args.falling)
		{
			this.checkDropDash();
			this.args.jumping = false;
		}

		for(const behavior of this.behaviors)
		{
			behavior.update(this);
		}

		if(this.twister)
		{
			this.twister.args.x = this.args.x;
			this.twister.args.y = this.args.y;

			this.twister.args.xOff = this.args.xOff;
			this.twister.args.yOff = this.args.yOff;

			this.twister.args.width  = this.args.width;
			this.twister.args.height = this.args.height;
		}

		if(this.pincherBg)
		{
			this.pincherBg.args.x = this.args.x;
			this.pincherBg.args.y = this.args.y;

			this.pincherBg.args.xOff = this.args.xOff;
			this.pincherBg.args.yOff = this.args.yOff;

			this.pincherBg.args.width  = this.args.width;
			this.pincherBg.args.height = this.args.height;
		}

		if(this.pincherFg)
		{
			this.pincherFg.args.x = this.args.x;
			this.pincherFg.args.y = this.args.y;

			this.pincherFg.args.xOff = this.args.xOff;
			this.pincherFg.args.yOff = this.args.yOff;

			this.pincherFg.args.width  = this.args.width;
			this.pincherFg.args.height = this.args.height;
		}

		if(this.args.falling)
		{
			this.args.rolling = false;
			this.fallTime++;
		}
		else
		{
			this.args.idleTime++;

			if(this.yAxis || this.xAxis)
			{
				this.args.idleTime = 0;
			}
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
			if(region.skimmers.has(this) || region.skimmers.has(Bindable.make(this)))
			{
				continue;
			}

			if(!region.args.drag && region.args.drag !== 0)
			{
				continue;
			}

			if(region.args.drag < drag)
			{
				drag = region.args.drag;
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
		const radius = Math.ceil(this.args.width / 2);

		const wasPaused = this.paused;

		if(this.args.pushing && this.args.pushing === Math.sign(this.args.gSpeed))
		{
			this.args.gSpeed = 0;
			return;
		}

		this.args.pushing = false;

		if(this.args.gSpeed)
		{
			const scanDist  = radius + Math.abs(this.args.gSpeed);
			const direction = Math.sign(this.args.gSpeed);

			const max  = Math.abs(this.args.gSpeed);
			const step = 1;

			this.pause(true);

			let iter = 0

			const headBlock = this.scanForward(this.args.gSpeed, 1);

			if(headBlock === false || headBlock > 0)
			{
				for(let s = 0; s < max; s += step)
				{
					if(this.args.height > 8 && this.args.modeTime > 1)
					{
						if(!this.args.rolling)
						{
							const headPoint = this.rotatePoint(
								radius * -direction
								, this.args.height
							);

							let headBlock = this.getMapSolidAt(this.x + headPoint[0], this.y + headPoint[1]);

							if(Array.isArray(headBlock))
							{
								headBlock = headBlock
								.filter(x =>
									x.args !== this.args
									&& x.callCollideHandler(this)
									&& x.solid
								)
								.length;
							}

							if(headBlock)
							{
								if(this.args.mode === MODE_CEILING)
								{
									this.args.x += radius * Math.sign(this.args.gSpeed);
									this.args.y += this.args.height;

									this.args.mode = MODE_FLOOR;
								}

								this.args.pushing = Math.sign(this.args.gSpeed);

								this.args.gSpeed = 0;
								break;
							}
						}

						if(this.args.groundAngle === 0)
						{
							const waistPoint = this.rotatePoint(radius * -direction, this.args.height * 0.5);

							let waistBlock = this.getMapSolidAt(this.x + waistPoint[0], this.y + waistPoint[1])

							if(Array.isArray(waistBlock))
							{
								waistBlock = waistBlock
									.filter(x =>
										x.args !== this.args
										&& x.callCollideHandler(this)
										&& x.solid
									)
									.length;
							}

							if(waistBlock)
							{
								if(this.args.mode === MODE_CEILING)
								{
									this.args.x += radius * Math.sign(this.args.gSpeed);
									this.args.y += this.args.rollingeight || this.args.height;

									this.args.mode = MODE_FLOOR;
								}

								this.args.pushing = Math.sign(this.args.gSpeed);

								this.args.gSpeed = 0;
								break;
							}
						}
					}

					for(const behavior of this.behaviors)
					{
						behavior.movedGround && behavior.movedGround(this);
					}

					nextPosition = this.findNextStep(step * direction);

					if(this.args.falling)
					{
						return;
					}

					if(!nextPosition)
					{
						break;
					}

					if(nextPosition[3])
					{
						this.args.moving = false;
						this.args.gSpeed = 0.15 * Math.sign(this.args.gSpeed);

						if(this.args.mode === MODE_LEFT || this.args.mode === MODE_RIGHT)
						{
							this.args.mode = MODE_FLOOR;
							this.lastAngles = [];
						}

						break;
					}
					else if(nextPosition[2] === true)
					{
						const gSpeed = this.args.gSpeed;
						const gAngle = this.args.groundAngle;

						this.args.standingLayer = null;

						let radius;

						switch(this.args.mode)
						{
							case MODE_FLOOR:

								radius = (this.args.width / 2);

								if(Math.abs(gSpeed) < radius)
								{
									this.args.x += radius * Math.sign(gSpeed);
								}
								else
								{
									this.args.x += gSpeed;
								}

								this.args.xSpeed =  gSpeed * Math.cos(gAngle);
								this.args.ySpeed = -gSpeed * Math.sin(gAngle);

								this.args.float = this.args.float < 0 ? this.args.float : 1;

								let falling = !!this.args.gSpeed;

								if(this.checkBelow(this.x, this.y))
								{
									this.args.gSpeed = gSpeed;
									this.args.xSpeed = 0;
									this.args.ySpeed = 0;
									falling = false;

									if(this.canRoll && this.yAxis > 0.55)
									{
										this.args.rolling = true;
									}
								}

								this.args.falling = falling;

								this.args.ignore = 2;

								break;

							case MODE_CEILING:

								this.args.y += this.args.height;
								// this.args.y++;

								this.args.float = this.args.float < 0 ? this.args.float : 1;

								this.args.falling = true;

								// this.args.groundAngle  = Math.PI;
								// this.args.displayAngle = Math.PI;

								this.args.mode   = MODE_FLOOR;
								this.args.xSpeed = -gSpeed * Math.cos(gAngle);
								this.args.ySpeed = gSpeed * Math.sin(gAngle);

								this.lastAngles.splice(0);
								this.args.direction *= -1;

								if(!this.args.rolling)
								{
									this.args.facing = this.args.facing === 'left' ? 'right' : 'left';
								}


								this.args.ignore = 3;

								break;

							case MODE_LEFT:

								radius = (this.args.height / 2);

								if(!this.args.climbing)
								{
									if(Math.abs(this.args.gSpeed) < 2 && !this.args.rolling)
									{
										if(this.args.gSpeed < 0)
										{
											this.args.x -= this.args.direction;
											this.args.y -= this.args.gSpeed + -2;
											this.args.groundAngle = 0;
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
										this.args.x += radius;
									}

									this.args.xSpeed  =  gSpeed * Math.sin(gAngle);
									this.args.ySpeed  =  gSpeed * Math.cos(gAngle);

									this.args.groundAngle = -Math.PI * 0.5;
									// this.args.mode = MODE_FLOOR;
									// this.onNextFrame(() => {
									// });
								}

								this.args.falling = true;

								break;

							case MODE_RIGHT:

								radius = (this.args.height / 2);

								if(!this.args.climbing)
								{
									if(Math.abs(this.args.gSpeed) < 2 && !this.args.rolling)
									{
										if(this.args.gSpeed > 0)
										{
											this.args.x -= this.args.direction;
											this.args.y -= this.args.gSpeed + 2;
											this.args.groundAngle = 0;
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
										this.args.x -= radius;
									}

									this.args.xSpeed  = -gSpeed * Math.sin(gAngle);
									this.args.ySpeed  = -gSpeed * Math.cos(gAngle);

									this.args.groundAngle = Math.PI * 0.5;
									// this.args.mode = MODE_FLOOR;
									// this.onNextFrame(() => {
									// });

								}

								this.args.falling = true;

								break;
						}

						break;
					}
					else if(!nextPosition[0] && !nextPosition[1])
					{
						this.args.moving = false;

						switch(this.args.mode)
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
							: (Math.sign(nextPosition[1]) * Math.PI / 2);

						this.lastAngles.unshift(this.args.angle);

						this.lastAngles.splice(this.angleAvg);
					}

					if(!this.rotateLock)
					{
						switch(this.args.mode)
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

						if(this.args.angle > Math.PI / 4 && this.args.angle < Math.PI / 2)
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
						else if(this.args.angle < -Math.PI / 4 && this.args.angle > -Math.PI / 2)
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
			}
			else
			{
				this.args.pushing = Math.sign(this.args.gSpeed);
				this.args.gSpeed  = 0;
			}

			const hRadius = Math.round(this.args.height / 2);

			if(!this.static && this.args.mode === MODE_FLOOR)
			{
				while((this.args.gSpeed <= 0 || this.args.modeTime < 3)
					 && this.getMapSolidAt(this.x - radius, this.y - hRadius, false)
				){
					this.args.x++;
				}

				while((this.args.gSpeed >= 0 || this.args.modeTime < 3)
					&& this.getMapSolidAt(this.x + radius, this.y - hRadius, false)
				){
					this.args.x--;
				}
			}

			wasPaused || this.pause(false);

			const pushFoward = this.xAxis && (Math.sign(this.xAxis) === Math.sign(this.args.gSpeed));

			if(
				this.args.mode === MODE_FLOOR
				|| this.args.mode === MODE_CEILING
				|| (this.args.gSpeed > 0 && this.args.mode === MODE_LEFT)
				|| (this.args.gSpeed < 0 && this.args.mode === MODE_RIGHT)
			){
				const pushBack = this.xAxis && (Math.sign(this.xAxis) !== Math.sign(this.args.gSpeed));
				const decel    = this.args.decel * ((this.args.rolling && pushBack) ? 3 : 0.75);

				if(!this.args.climbing && this.args.gSpeed && (!pushFoward || this.args.rolling))
				{
					if(this.args.grinding)
					{
						if(this.yAxis > 0.5)
						{
							// this.args.gSpeed -= decel * 1/drag * 0.06125 * Math.sign(this.args.gSpeed);
						}
						else
						{
							this.args.gSpeed -= decel * 1/drag * 0.125 * Math.sign(this.args.gSpeed);
						}
					}
					else if(this.args.rolling)
					{
						this.args.gSpeed -= decel * 1/drag * 0.06125 * Math.sign(this.args.gSpeed);
					}

					else if(!this.args.grinding && !this.args.rolling && (!this.xAxis || pushBack))
					{
						this.args.gSpeed -= decel * 1/drag * Math.sign(this.args.gSpeed);
					}
				}
			}

			if(!pushFoward && Math.abs(this.args.gSpeed) < 1)
			{
				if(!this.args.wallSticking)
				{
					this.args.gSpeed = 0;
				}
			}

			let slopeFactor = 0;

			if(!this.args.climbing)
			{
				switch(this.args.mode)
				{
					case MODE_FLOOR:

						slopeFactor = this.args.groundAngle / (Math.PI/2);

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

							slopeFactor -= this.args.groundAngle / (Math.PI/4);
						}
						else
						{
							slopeFactor = 1;

							slopeFactor += this.args.groundAngle / (Math.PI/4) ;
						}
						break;

					case MODE_LEFT:

						if(direction > 0)
						{
							slopeFactor = 1;

							slopeFactor -= this.args.groundAngle / (Math.PI/4);
						}
						else
						{
							slopeFactor = -1;

							slopeFactor += this.args.groundAngle / (Math.PI/4) ;
						}

						break;
				}

				if(this.args.rolling)
				{
					if(slopeFactor < 0)
					{
						this.args.gSpeed += slopeFactor * Math.sign(this.args.gSpeed) * (this.args.decel*0.25);
					}
					else if(slopeFactor > 0)
					{
						this.args.gSpeed += slopeFactor * Math.sign(this.args.gSpeed) * (this.args.accel * 2);
					}
				}
				else if(this.args.grinding)
				{
					const speed = Math.abs(this.args.gSpeed);

					const direction = this.args.direction || this.xSpeedLast || 1;

					this.args.direction = direction;

					if(Math.sign(this.args.gSpeed) !== Math.sign(this.args.direction))
					{
						this.args.gSpeed = 0;
					}

					if(speed < 6)
					{
						this.args.gSpeed = 6 * direction;
					}
					else if(speed > 40)
					{
						this.args.gSpeed = 40 * direction;
					}
					else if(slopeFactor < 0)
					{
						this.args.gSpeed *= 1.0000 - (0-(slopeFactor/2) * 0.015);
					}
					else if(slopeFactor > 0)
					{
						this.args.gSpeed *= 1.0015 * (1+(slopeFactor/2) * 0.045);
					}
					else
					{
						this.args.gSpeed += 0.1 * direction;
					}
				}
				else if(!this.stayStuck)
				{
					let speedFactor = 1;

					if(slopeFactor < 0 && Math.abs(this.args.gSpeed) < 10)
					{
						speedFactor = 0.99990 * (1 - (slopeFactor**2/4) / 2);
					}
					else if(slopeFactor > 1 && Math.abs(this.args.gSpeed) < this.args.gSpeedMax / 2)
					{
						speedFactor = 1.05000 * (1 + (slopeFactor**2/4) / 2);
					}

					this.args.gSpeed *= speedFactor;

					if(Math.abs(this.args.gSpeed) < 1)
					{
						if(slopeFactor <= -1)
						{
							this.args.gSpeed *= -0.5;
							this.args.ignore = this.args.ignore || 8;
						}
					}
				}
			}
		}

		if(nextPosition && (nextPosition[0] !== false || nextPosition[1] !== false))
		{
		}
		else
		{
			this.args.ignore = this.args.ignore || 1;

			if(this.args.falling)
			{
				this.args.gSpeed = 0;
			}
		}

		// if(this.controllable)
		// {
		// 	const radius = 0.5 * this.args.width;
		// 	const direction = Math.sign(this.args.xSpeed);
		// 	const height = Math.max(this.args.height, 0);

		// 	const headPoint = this.rotatePoint(0, height * 0.75);
		// 	// const headPoint = this.rotatePoint(radius * -direction, this.args.height * 0.75);

		// 	let jumpBlock = this.getMapSolidAt(this.x + headPoint[0], this.y + headPoint[1]);

		// 	if(Array.isArray(jumpBlock))
		// 	{
		// 		jumpBlock = !!jumpBlock.filter(a => !a.args.platform && !a.isVehicle).length;
		// 	}

		// 	if(!this.args.falling && this.checkBelow(this.x, this.y) && jumpBlock)
		// 	{
		// 		console.log(this.realAngle, this.args.groundAngle, this.args.mode);
		// 		console.log([this.x + headPoint[0], this.y + headPoint[1]]);
		// 		console.log(headPoint);

		// 		this.die();

		// 		return;
		// 	}
		// }
	}

	findAirPointA(i, point, actor)
	{
		if(!actor.viewport)
		{
			return;
		}

		const viewport = actor.viewport;
		const tileMap  = viewport.tileMap;

		const actors = viewport.actorsAtPoint(point[0], point[1])
			.filter(x =>
				x.args !== actor.args
				&& x.callCollideHandler(actor)
				&& x.solid
			);

		if(actors.length > 0)
		{
			return actor.lastPointA;
		}

		const solid = tileMap.getSolid(point[0], point[1], actor.args.layer);

		if(solid)
		{
			return actor.lastPointA;
		}

		Object.assign(actor.lastPointA, point.map(Math.trunc));
	}

	findAirPointB(i, point, actor)
	{
		if(!actor.viewport)
		{
			return;
		}

		const viewport = actor.viewport;
		const tileMap  = viewport.tileMap;

		const actors = viewport.actorsAtPoint(point[0], point[1])
			.filter(x =>
				x.args !== actor.args
				&& x.callCollideHandler(actor)
				&& x.solid
			);

		if(actors.length > 0)
		{
			return actor.lastPointB;
		}

		if(tileMap.getSolid(point[0], point[1], actor.args.layer))
		{
			return actor.lastPointB;
		}

		Object.assign(actor.lastPointB, point.map(Math.trunc));
	}

	updateAirPosition()
	{
		let xSpeedOriginal = this.args.xSpeed;
		let ySpeedOriginal = this.args.ySpeed;

		this.args.standingLayer = null;

		const viewport  = this.viewport;
		const radius    = Math.ceil(this.args.width / 2);
		const direction = Math.sign(this.args.xSpeed);

		const tileMap = this.viewport.tileMap;

		const cSquared  = this.args.xSpeed**2 + this.args.ySpeed**2;
		const airSpeed  = cSquared ? Math.sqrt(cSquared) : 0;

		this.args.airSpeed = airSpeed;

		if(!airSpeed)
		{
			return;
		}

		if(this.controllable || this.isVehicle)
		{
			const quickSpin = this.springing;

			this.args.groundAngle += -Math.sign(this.args.groundAngle) * 0.001 * (quickSpin ? 125 : 50);
		}

		if(Math.abs(this.args.groundAngle) < 0.04)
		{
			this.args.groundAngle = 0;
		}

		if(this.noClip)
		{
			this.args.x += this.args.xSpeed;
			this.args.y += this.args.ySpeed;

			return;
		}

		const upMargin = (this.args.flying
			? (this.args.height + this.args.yMargin)
			: this.args.height) || 1;

		this.upScan = true;

		// const upDistance = this.castRay(
		// 	Math.abs(this.args.ySpeed) + upMargin
		// 	, -Math.PI / 2
		// 	, this.findSolid
		// );

		const upScanDist = this.args.ySpeed < 0
			? (-this.args.ySpeed + upMargin)
			: 0;

		const upDistanceL = this.castRay(
			upScanDist
			, -Math.PI / 2
			, [-this.args.width/2 , 0]
			, this.findSolid
		);

		const upDistanceR = this.castRay(
			upScanDist
			, -Math.PI / 2
			, [this.args.width/2, 0]
			, this.findSolid
		);

		const upDistance = (upDistanceL || upDistanceR)
			? Math.min(...[upDistanceL, upDistanceR].filter(x => x !== false))
			: false;

		this.upScan = false;

		let hits = [];

		if(!this.args.hLock)
		{
			const hScanDist = this.args.xSpeed;

			const foreDistanceHead  = hScanDist ? this.scanForward(hScanDist, 0.9) : false;
			const foreDistanceWaist = hScanDist ? this.scanForward(hScanDist, 0.5) : false;
			const foreDistanceFoot  = hScanDist ? this.scanForward(hScanDist, 0.1) : false;

			const distances = [foreDistanceHead, foreDistanceWaist, foreDistanceFoot];

			// if(this.controllable && !this.args.falling && !this.args.rolling)
			// {
			// 	distances.push(foreDistanceFoot);
			// }

			hits = distances.filter(x => x !== false);
		}

		if(this.args.ySpeed && upDistance && this.lastLayer && this.lastLayer.offsetYChanged)
		{
			this.args.y += this.lastLayer.offsetYChanged + 1;

			this.args.ySpeed = this.lastLayer.offsetYChanged + 1;

			this.lastLayer = null;

			return;
		}

		let upCollisionAngle = false;

		if(![upDistanceL, upDistanceR].some(x => x === false))
		{
			upCollisionAngle = Math.atan2(upDistanceL - upDistanceR, this.args.width);
		}

		const willStick = this.willStick || this.args.deepJump;
		const xMove = this.xLast - this.x;

		if(upDistanceL
			&& upDistanceR
			&& upDistance <= upScanDist
			&& (!this.args.flying || this.canStick)
			// && !this.args.flying
			&& Math.abs(upCollisionAngle) < Math.PI / 4
			&& this.args.ySpeed <= 0
		){
			this.args.y -= upDistance - this.args.height;

			if(this.args.ySpeed)
			{
				this.args.falling = true;
			}

			this.args.ySpeed = Math.max(0, this.args.ySpeed);

			return;
		}

		if(!this.willStick
			&& hits.length > 1
			&& (upDistance === false || upDistance < this.args.height)
		){
			const xDirection = Math.sign(this.args.xSpeed);
			// const xDirection = Math.sign(xMove);

			const maxHit = Math.max(...hits);
			// const minHit = Math.min(...hits);

			const shiftBy = this.args.width + -maxHit;
			// const shiftBy = radius + -maxHit;
			const shift = shiftBy * -xDirection;

			if(!isNaN(shift) && (!shift || Math.sign(shift) === Math.sign(this.args.xSpeed)))
			{
				this.args.x += shift;

				this.args.ignore = Math.max(this.args.ignore, 2);

				this.args.flySpeed = 0;
				this.args.xSpeed   = 0;
				this.args.gSpeed   = 0;
				this.args.mode     = MODE_FLOOR;
			}
		}

		Object.assign(this.lastPointA, [this.x, this.y].map(Math.trunc));
		Object.assign(this.lastPointB, [this.x, this.y].map(Math.trunc));

		const scanDist = 1 + airSpeed;

		const airPoint = this.castRay(
			scanDist
			, this.airAngle
			, this.findAirPointA
		);

		const airPointB = this.rotateLock
			? airPoint
			: this.castRay(
				scanDist
				, this.airAngle
				, [0, -3 * Math.sign(this.args.ySpeed || 1)]
				, this.findAirPointB
			);

		this.willJump = false;

		let blockers = false;

		let collisionAngle = false;

		if(![airPoint, airPointB].some(x => x === false))
		{
			collisionAngle = Math.atan2(airPoint[1] - airPointB[1], airPoint[0] - airPointB[0]);
		}

		this.xLast = this.args.x;
		this.yLast = this.args.y;

		if(airPoint !== false)
		{
			let angleIsWall = false;

			if(xSpeedOriginal < 0)
			{
				angleIsWall = collisionAngle <= Math.PI / 2;
			}

			if(xSpeedOriginal > 0)
			{
				angleIsWall = collisionAngle >= Math.PI / 2;
			}

			const isLeft  = angleIsWall && xSpeedOriginal < 0;
			const isRight = angleIsWall && xSpeedOriginal > 0;

			if(!this.willStick)
			{
				this.args.gSpeed = xSpeedOriginal || this.args.gSpeed;
			}

			const stickX = airPoint[0];
			const stickY = airPoint[1];

			let away = false;

			if(!this.args.ySpeed || Math.sign(stickY - this.y) === Math.sign(this.args.ySpeed))
			{
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;

				// if(this.args.flying && !angleIsWall && collisionAngle)
				// {
				// 	this.args.mode = MODE_CEILING;
				// 	this.args.xSpeed *= -1;
				// }
			}
			else
			{
				// this.args.y++;
				away = true;
			}

			// if(!this.viewport.tileMap.getSolid(stickX, stickY))
			// {
			// }
			this.args.x = stickX;
			this.args.y = stickY;

			const solid = this.checkBelow(this.x, this.y);

			blockers = this.getMapSolidAt(this.x + direction, this.y);

			if(Array.isArray(blockers))
			{
				blockers = blockers.filter(a => a.callCollideHandler(this));

				if(!blockers.length)
				{
					blockers = false;
				}
			}

			if(!this.rotateLock)
			{
				if(upCollisionAngle !== false && upCollisionAngle < 0)
				{
					this.args.gSpeed = 0;
					this.args.mode = MODE_LEFT;

					this.args.direction = 1;
					this.args.facing = 'right';
				}
				else if(upCollisionAngle !== false && upCollisionAngle > 0)
				{
					this.args.gSpeed = 0;
					this.args.mode = MODE_RIGHT;

					this.args.direction = -1;
					this.args.facing = 'left';
				}
				else if((this.willStick || (!isLeft && !isRight))
					&& !this.getMapSolidAt(this.x - direction, this.y)
					&& !this.getMapSolidAt(this.x - direction, this.y + 1)
				){
					if(isLeft)
					{
						this.args.gSpeed = 0;
						this.args.mode = MODE_LEFT;

						this.args.direction = 1;
						this.args.facing = 'right';
					}
					else if(isRight)
					{
						this.args.gSpeed = 0;
						this.args.mode = MODE_RIGHT;

						this.args.direction = -1;
						this.args.facing = 'left';
					}
					else if(upCollisionAngle !== false)
					{
						this.args.mode = MODE_CEILING;
					}
				}
			}

			// if(this.args.ySpeed < 0 && Math.abs(upCollisionAngle - Math.PI/2) < Math.PI/8)
			// {
			// 	return;
			// }

			const halfWidth    = Math.floor(this.args.width / 2);

			const sensorSpread = 4;
			const backPosition = this.findNextStep(-sensorSpread * 0.5);
			const forePosition = this.findNextStep(sensorSpread * 0.5);

			if(forePosition && backPosition)
			{
				const newAngle = (ySpeedOriginal < 0 ? -1 : 1) * Number(Math.atan2(
					forePosition[1] - backPosition[1]
					, forePosition[0] - backPosition[0]
				));

				if(isNaN(newAngle))
				{
					console.log(newAngle);

					throw new Error('angle is NAN!');
				}

				// const shallowLedgePoint = this.findNextStep(backPosition[1] < forePosition[1] ? 3 : -3);

				// let shallowLedge = false;

				// if(shallowLedgePoint[1] === Math.max(backPosition[1], forePosition[1]))
				// {
				// 	shallowLedge = true;
				// }

				// if(shallowLedge && Math.abs(forePosition[1] - backPosition[1]) > 2 * this.maxStep)
				// {
				// 	this.args.x += backPosition[1] < forePosition[1] ? -1 : 1;

				// 	this.args.ySpeed = ySpeedOriginal;

				// 	this.args.groundAngle = 0;
				// }
				// else
				if(!forePosition[2] && !backPosition[2] && !(forePosition[3] && backPosition[3]))
				{
					// this.args.groundAngle = this.args.angle = newAngle;

					if(this.canRoll && (this.yAxis > 0.55 || this.args.dropDashCharge))
					{
						this.args.rolling = true;
					}

					this.args.falling = false;
					this.args.groundAngle = newAngle;
					this.lastAngles.splice(0);
					// this.args.ignore = this.args.ignore || 5;

					const slopeDir = -Math.sign(this.args.groundAngle);

					let gSpeed = 0;

					if(Math.abs(slopeDir) > 0)
					{
						gSpeed += ySpeedOriginal * slopeDir;
					}
					else if(Math.abs(slopeDir) < 0)
					{
						gSpeed += ySpeedOriginal / -slopeDir;
					}

					gSpeed += xSpeedOriginal || -xMove;

					if(blockers && blockers.length)
					{
						gSpeed = 0;
					}

					if(this.args.mode % 2 == 1)
					{
						gSpeed *=-1;
					}

					// if(ySpeedOriginal)
					// {
					// 	gSpeed *= 0.75;
					// }

					if(gSpeed)
					{
						this.args.gSpeed = gSpeed;
					}

					if(typeof solid === 'object')
					{
						this.args.standingLayer = solid;
					}

					// this.args.x += gSpeed < 0 ? backPosition[0] : forePosition[0];
					// this.args.y += gSpeed < 0 ? backPosition[1] : forePosition[1];


					// this.args.xSpeed = 0;
					// this.args.ySpeed = 0;

				}
				else if(!this.args.dead && ((forePosition[2] && !backPosition[3]) || (!forePosition[3] && backPosition[2])))
				{
					this.args.falling = false;
					this.args.gSpeed = xSpeedOriginal;
					this.args.xSpeed = xSpeedOriginal;
					this.args.ySpeed = 0;

					this.args.x += xSpeedOriginal;
					this.args.y -= (forePosition[1] || backPosition[1]);

					this.args.y = Math.floor(this.args.y);

					return;
				}

				if(Math.abs(this.args.gSpeed) < 1)
				{
					// this.args.gSpeed = 0; //Math.sign(this.args.gSpeed);
				}
			}
		}
		else if(this.args.ySpeed > 0)
		{
			if(this.args.mode === MODE_LEFT || this.args.mode === MODE_RIGHT)
			{
				const direction = this.args.mode === MODE_LEFT ? -1 : 1;

				this.args.direction = direction;

				this.args.groundAngle = Math.PI / 2 * direction;
			}

			// this.args.mode = MODE_FLOOR;

			if(xSpeedOriginal && !this.args.falling)
			{
				this.args.gSpeed = Math.floor(xSpeedOriginal);
			}

			if(airPoint && (yPointDir === ySpeedDir || (!yPointDir && ySpeedDir === 1)))
			{
				this.args.x = Number(airPoint[0]);
				this.args.y = Number(airPoint[1]);

				this.args.falling = false;
			}
		}

		if(!tileMap.getSolid(this.x + (this.args.width / 2) * Math.sign(this.args.xSpeed), this.y, this.args.layer))
		{
			if(Math.abs(this.args.xSpeed) > this.args.xSpeedMax)
			{
				this.args.xSpeed = this.args.xSpeedMax * Math.sign(this.args.xSpeed);
			}

			if(Math.abs(this.args.ySpeed) > this.args.ySpeedMax)
			{
				this.args.ySpeed = this.args.ySpeedMax * Math.sign(this.args.ySpeed);
			}
		}

		if(airPoint === false)
		{
			if(this.args.xSpeed)
			{
				this.args.x = Number(Number(this.args.x) + Number(this.args.xSpeed));
			}

			if(this.args.ySpeed)
			{
				this.args.y = Number(Number(this.args.y) + Number(this.args.ySpeed));

				if(this.args.flying && this.args.ySpeed < 0 && upDistance > 0)
				{
					this.args.y += (upMargin - upDistance) + 4;
					this.args.ySpeed = 0;
				}
			}
		}
		else if(this.viewport && this.ySpeedLast > 0)
		{
			if(this.viewport.tileMap.getSolid(this.args.x, this.args.y)
				&& !this.viewport.tileMap.getSolid(this.args.x, this.args.y - 1)
			){
				this.args.y--;
			}
		}

		if(this.args.standingOn instanceof PointActor)
		{
			const groundTop = this.args.standingOn.y + -this.args.standingOn.args.height + -1;

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
			const dropBoost = this.dropDashCharge * Math.sign(this.args.direction);

			this.dropDashCharge = 0;

			this.onNextFrame(()=>{
				this.args.gSpeed += dropBoost
				this.args.rolling = true;
			});

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
		if(!this.viewport)
		{
			return;
		}

		if(this.viewport.args.cutScene)
		{
			this.args.cameraMode = 'cutScene';
			return;
		}

		if(this.args.bossMode)
		{
			this.args.cameraMode = 'boss';
			return;
		}

		if(this.args.standingOn && this.args.standingOn.isVehicle)
		{
			this.args.cameraMode = this.args.standingOn.args.cameraMode;
		}
		else if(this.args.localCameraMode)
		{
			this.args.cameraMode = this.args.localCameraMode;
		}
		else if(this.controllable)
		{
			if(!this.args.falling || this.getMapSolidAt(this.x, this.y + 24))
			{
				const forwardSolid = this.getMapSolidAt(this.x + 32 * this.args.direction, this.y + 24);
				const forwardDeepSolid = this.getMapSolidAt(this.x + 32 * this.args.direction, this.y + 96);
				const underSolid   = this.getMapSolidAt(this.x + 0  * this.args.direction, this.y + 48);

				if(this.args.mode === MODE_FLOOR && this.args.groundAngle === 0)
				{
					if(!underSolid && forwardSolid && !this.args.grinding && !this.args.skimming)
					{
						this.args.cameraMode = 'bridge';
					}
					// else if(!forwardSolid && !forwardDeepSolid && !this.args.grinding && !this.args.skimming)
					// {
					// 	this.args.cameraMode = 'cliff';
					// }
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
				if(this.getMapSolidAt(this.x + 0  * this.args.direction, this.y + 64))
				{
					this.args.cameraMode = 'normal';
				}
				else if(this.fallTime > 15)
				{
					this.args.cameraMode = 'aerial';
				}

				this.viewport.onFrameOut(45, () => {

					if(this.args.cameraMode === 'airplane')
					{
						return;
					}

					if(this.args.falling
						&& Math.abs(this.args.xSpeed > 25)
						&& !this.getMapSolidAt(this.x, this.y + 480)
					){
						this.args.cameraMode = 'airplane'
					}
				});
			}
		}
	}

	callCollideHandler(other)
	{
		if(this.ignores.has(other))
		{
			return false;
		}

		if(other.ignores.has(this))
		{
			return false;
		}

		if(this.args.dead || other.args.dead)
		{
			return;
		}

		if(other === this.args.hangingFrom)
		{
			return false;
		}

		if(this.isGhost || other.isGhost)
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

			// this.solid && !this.isVehicle && this.popOut(other);
		}

		if(!this.viewport)
		{
			return;
		}

		if(!this.viewport.collisions.has(this))
		{
			this.viewport.collisions.set(this, new Map);
		}

		if(!this.viewport.collisions.has(other))
		{
			this.viewport.collisions.set(other, new Map);
		}

		// if(this.viewport.collisions.get(this).has(other))
		// {
		// 	return;
		// }

		const invertType = type > -1 ? ((type + 2) % 4) : type;

		const collisionListA = this.viewport.collisions.get(this, type);
		const collisionListB = this.viewport.collisions.get(other, invertType);

		// other.pause(true);

		collisionListA.set(other, type);
		collisionListB.set(this, invertType);

		this.viewport.collisions.set(other, collisionListB);

		this.collideB(other, type);
		other.collideB(this, invertType);

		const ab = this.collideA(other, type);
		const ba = other.collideA(this, invertType);

		const result = ab || ba;

		this.args.colliding = this.colliding = (this.colliding || result || false);

		return result;
	}

	checkBelow(testX = null, testY = null)
	{
		testX = testX ?? this.x;
		testY = testY ?? this.y;

		const lPoint = [];
		const rPoint = [];

		const spread = 0;

		switch(this.args.mode)
		{
			case MODE_FLOOR:
				lPoint[0] = testX + spread;
				lPoint[1] = testY + 1;
				rPoint[0] = testX - spread;
				rPoint[1] = testY + 1;
				break;
			case MODE_LEFT:
				lPoint[0] = testX - 1;
				lPoint[1] = testY + spread;
				rPoint[0] = testX - 1;
				rPoint[1] = testY - spread;
				break;
			case MODE_CEILING:
				lPoint[0] = testX - spread;
				lPoint[1] = testY - 1;
				rPoint[0] = testX + spread;
				rPoint[1] = testY - 1;
				break;
			case MODE_RIGHT:
				lPoint[0] = testX + 1;
				lPoint[1] = testY + spread;
				rPoint[0] = testX + 1;
				rPoint[1] = testY - spread;
				break;
		}

		let below = this.getMapSolidAt(...lPoint);

		// if(!below)
		// {
		// 	below = this.getMapSolidAt(...rPoint);
		// }

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
			if(this.args.modeTime < 5)
			{
				return;
			}

			this.viewport.auras.add(this.args.standingOn);

			const vehicle = this.args.standingOn;

			vehicle.xAxis = this.xAxis;
			vehicle.yAxis = this.yAxis;

			vehicle.stayStuck = this.stayStuck;
			vehicle.willStick = this.willStick;

			this.processInputVehicle();

			this.args.direction = vehicle.args.direction;
			this.args.facing    = vehicle.args.facing;
			this.args.layer     = vehicle.args.layer;
			this.args.mode      = vehicle.args.mode;
			this.args.angle     = vehicle.args.angle;

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

		let gSpeedMax = this.args.gSpeedMax;

		if(this.running)
		{
			gSpeedMax = RUNNING_SPEED;
		}
		else if(this.crawling)
		{
			gSpeedMax = CRAWLING_SPEED;
		}

		const drag = this.getLocalDrag();

		if(this.noClip)
		{
			if(!this.args.ignore)
			{
				this.args.xSpeed += xAxis * this.args.airAccel * drag;
				this.args.ySpeed += yAxis * this.args.airAccel * drag;

				if(!xAxis)
				{
					this.args.xSpeed = 0;
				}

				if(!yAxis)
				{
					this.args.ySpeed = 0;
				}
			}
		}
		else if(!this.args.falling)
		{
			if(xAxis && !this.args.rolling)
			{
				const axisSign = Math.sign(xAxis);
				const sign     = Math.sign(gSpeed);
				let gSpeed     = this.args.gSpeed;

				if(!this.args.rolling && !this.args.climbing && !this.args.ignore && !this.args.wallSticking)
				{
					if(axisSign === sign || !sign)
					{
						gSpeed += xAxis * this.args.accel * drag;

						if(Math.abs(axisSign - sign) === 2)
						{
							this.args.ignore = 10;
						}
					}
					else if(!this.args.ignore)
					{
						gSpeed += xAxis * this.args.accel * drag * this.args.skidTraction;
					}
				}

				if(Math.abs(gSpeed) > gSpeedMax)
				{
					gSpeed = gSpeedMax * Math.sign(gSpeed);
				}

				if(!Math.sign(this.args.gSpeed) || Math.sign(this.args.gSpeed) === Math.sign(gSpeed))
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
		else if(this.args.falling && xAxis && Math.abs(this.args.xSpeed) < this.args.xSpeedMax)
		{
			if(Math.abs(this.args.xSpeed) < this.args.gSpeedMax && !this.args.ignore)
			{
				this.args.xSpeed += xAxis * this.args.airAccel * drag;
			}

			// const tileMap = this.viewport.tileMap;

			// if(!this.noClip && this.getMapSolidAt(this.x + (this.args.width / 2) * Math.sign(this.args.xSpeed), this.y))
			// {
			// 	this.args.xSpeed = 0;
			// }
		}

		if(xAxis < 0 && this.args.gSpeed && !this.args.ignore)
		{
			if(!this.args.climbing)
			{
				this.args.facing = 'left';
			}

			if(!this.args.grinding || Math.abs(this.args.gSpeed) < 3)
			{
				this.args.direction = -1;
			}
		}

		if(xAxis > 0 && this.args.gSpeed && !this.args.ignore)
		{
			if(!this.args.climbing)
			{
				this.args.facing = 'right';
			}

			if(!this.args.grinding || Math.abs(this.args.gSpeed) < 3)
			{
				this.args.direction = 1;
			}
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

	findDownSolid(i, point, actor)
	{
		if(!actor.viewport)
		{
			return;
		}

		const viewport = actor.viewport;
		const tileMap  = viewport.tileMap;

		if(actor.args.groundAngle === 0)
		{
			const regions = actor.viewport.regionsAtPoint(point[0], point[1]);

			for(const region of regions)
			{
				if(actor.args.mode === MODE_FLOOR
					&& -1 + point[1] === region.y + -region.public.height
					&& Math.abs(actor.args.gSpeed) >= region.skimSpeed
				){
					return -1 + i;
				}
			}
		}

		if(tileMap.getSolid(point[0], point[1], actor.args.layer))
		{
			return i;
		}

		const actors = viewport.actorsAtPoint(point[0], point[1])
			.filter(a =>
				a.args !== actor.args
				&& a.callCollideHandler(actor)
				&& a.solid
			);

		if(actors.length > 0)
		{
			return i;
		}
	}

	findUpSpace(i, point, actor)
	{
		if(!actor.viewport)
		{
			return;
		}

		const viewport = actor.viewport;
		const tileMap  = viewport.tileMap;

		if(actor.args.groundAngle <= 0)
		{
			const regions = actor.viewport.regionsAtPoint(point[0], point[1]);

			for(const region of regions)
			{
				if(actor.args.mode !== MODE_FLOOR
					|| point[1] !== 1 + region.y + -region.args.height
					|| Math.abs(actor.args.gSpeed) <= region.skimSpeed
				){
					const actors = viewport.actorsAtPoint(point[0], point[1])
						.filter(x =>
							x.args !== actor.args
							&& x.callCollideHandler(actor)
							&& x.solid
						);

					if(actors.length === 0)
					{
						if(!tileMap.getSolid(point[0], point[1], actor.args.layer))
						{
							return i;
						}
					}
				}
			}
		}

		const actors = viewport.actorsAtPoint(point[0], point[1])
			.filter(x =>
				x.args !== actor.args
				&& x.callCollideHandler(actor)
				&& x.solid
			);

		if(actors.length === 0)
		{
			if(!tileMap.getSolid(point[0], point[1], actor.args.layer))
			{
				return i;
			}
		}
	}

	findNextStep(offset)
	{
		if(!this.viewport)
		{
			return;
		}

		if(this.stepCache[offset] !== undefined)
		{
			return this.stepCache[offset];
		}

		const viewport = this.viewport;
		const tileMap  = viewport.tileMap;
		const maxStep  = this.maxStep * ((this.args.falling&&!this.args.xSpeed) ? 3 : 1);
		const radius   = Math.max(this.args.width / 2, 1);

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

			switch(this.args.mode)
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
				maxStep// * (1+col)
				, this.downAngle
				, offsetPoint
				, this.findDownSolid
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

				switch(this.args.mode)
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

				const upLength = +1 + maxStep;

				upFirstSpace = this.castRay(
					upLength
					, this.upAngle
					, offsetPoint
					, this.findUpSpace
				);

				const upDiff = Math.abs(prevUp - upFirstSpace);

				if(upFirstSpace === false)
				{
					return [false, false, false, true];
				}

				if(upDiff >= maxStep)
				{
					return [false, false, false, true];
				}

				prev = prevUp = upFirstSpace;
			}
			else
			{
				prev = prevDown = downFirstSolid;
			}

			if(upFirstSpace !== false)
			{
				this.stepCache[col * sign] = [col * sign, upFirstSpace, false];
			}
			else
			{
				this.stepCache[col * sign] = [col * sign, -downFirstSolid, false];
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
				this.args.x + offset[0] + (i * Math.cos(angle))
				, this.args.y + offset[1] + (i * Math.sin(angle))
			];

			const retVal = callback(i, bottom, this);

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
			this.args.ignore
			|| this.args.falling
			|| !this.args.landed
			|| this.args.float
		){
			return;
		}

		if(this.args.standingOn && this.args.standingOn.args.yForce)
		{
			force += Math.max(0, this.args.standingOn.args.yForce * 0.25);
		}
		else if(this.args.standingOn && this.args.standingOn.yLast)
		{
			force += Math.max(0, this.args.standingOn.yLast - this.args.standingOn.args.y);
		}

		const radius     = this.args.width / 2;
		const scanRadius = Math.min(radius, 4);

		const backPosition = this.findNextStep(-scanRadius);
		const forePosition = this.findNextStep(+scanRadius);
		const sensorSpread = scanRadius * 2;

		let groundAngle = Math.atan2(backPosition[1] - forePosition[1], Math.ceil(sensorSpread));

		this.args.ignore  = 6;
		this.args.pushing = false;
		this.args.landed  = false;
		this.args.falling = true;

		const originalMode = this.args.mode;

		switch(this.args.mode)
		{
			case MODE_FLOOR:
				this.args.y -= 16;
				break;

			case MODE_RIGHT:
				groundAngle += -Math.PI / 2;
				this.args.x += -this.args.width / 2;
				break;

			case MODE_CEILING:
				groundAngle += Math.PI;
				this.args.y += this.args.normalHeight || this.args.height;
				break;

			case MODE_LEFT:
				groundAngle += Math.PI / 2;
				this.args.x += this.args.width / 2;
				break;
		}

		let gSpeedReal = this.args.gSpeed;

		if(this.args.standingOn && this.args.standingOn.args.convey)
		{
			gSpeedReal += this.args.standingOn.args.convey;
		}

		this.args.standingOn = null;

		this.args.xSpeed = gSpeedReal * Math.cos(groundAngle);
		this.args.ySpeed = gSpeedReal * Math.sin(groundAngle);

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

		if(tileMap.getSolid(this.x + (this.args.width / 2) * Math.sign(this.args.xSpeed), this.y, this.args.layer))
		{
			// if(tileMap.getSolid(this.x + (1 + this.args.width / 2) * Math.sign(this.args.xSpeed), this.y, this.args.layer))
			// {
			// 	this.args.x -= 2 * Math.sign(this.args.xSpeed);
			// }

			this.args.xSpeed = 0;
		}

		this.args.rolling = false;

		this.args.mode = MODE_FLOOR;

		this.args.groundAngle = 0;
		this.args.gSpeed = 0;
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

			if(a.args.gone)
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

	immune(other, type = 'normal')
	{
		if(this.args.mercy)
		{
			return true;
		}

		const shield = this.args.currentSheild;

		if(shield && shield.immune && shield.immune(this, other, type))
		{
			return true;
		}

		return false;
	}

	damage(other, type = 'normal')
	{
		const shield = this.args.currentSheild;

		const damageEvent = new CustomEvent('damage', {cancelable:true, detail:{other,type}});

		if(!this.dispatchEvent(damageEvent))
		{
			return;
		}

		if(this.args.mercy)
		{
			return;
		}

		if(this.args.rings)
		{
			this.args.mercy = true;

			this.startle(other);

			this.viewport.onFrameOut(180, () => this.args.mercy = false);

			this.onNextFrame(()=>{

				if(!shield || !shield.protect)
				{
					this.loseRings();
					this.args.rings = 0;
				}
			});
		}
		else if(this.controllable)
		{
			this.die();
		}
	}

	startle(other)
	{
		if(this.noClip)
		{
			return;
		}

		this.args.jumping  = false;
		this.args.startled = 180;
		this.args.ignore   = 30;

		const direction = Math.sign(this.args.xSpeed || this.args.gSpeed || this.args.direction);

		this.args.gSpeed = 0;
		this.args.float  = 1;

		this.viewport.onFrameOut(1, () => {
			this.args.xSpeed = -2.25 * direction;
			this.args.ySpeed = -8.00;

			this.args.standingOn = false;

			if(this.args.mode === MODE_CEILING)
			{
				this.args.xSpeed *= -1;
				this.args.ySpeed *= -1;
			}

			this.args.gSpeed = 0;

			this.args.falling = true;
		});
	}

	findSolid(i, point, actor)
	{
		if(!actor.viewport)
		{
			return;
		}

		const viewport = actor.viewport;
		const tileMap  = viewport.tileMap;

		const actors = viewport.actorsAtPoint(point[0], point[1])
		.filter(x =>
			(x.args !== actor.args)
			&& x.callCollideHandler(actor)
			&& x.solid
		);

		if(actors.length > 0)
		{
			return i;
		}

		const solid = tileMap.getSolid(point[0], point[1], actor.args.layer);

		if(actor.upScan)
		{
			actor.lastLayer = solid;
		}

		if(solid)
		{
			return i;
		}
	}

	findSolidTile(i, point, actor)
	{
		const solid = tileMap.getSolid(point[0], point[1], actor.args.layer);

		if(this.upScan)
		{
			actor.lastLayer = solid;
		}

		if(solid)
		{
			return i;
		}
	}

	scanForward(speed, height = 0.5, scanActors = true)
	{
		const dir      = Math.sign(speed);
		const radius   = Math.round(this.args.width / 2);
		// const hRadius  = Math.round(this.args.height / 2);
		const scanDist = Math.ceil(Math.abs(speed));
		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		const tileMap  = viewport.tileMap;

		const startPoint = this.args.falling
			? [radius * -dir, -this.args.height * height]
			: this.rotatePoint(radius * -dir, this.args.height * height);

		return this.castRay(
			scanDist + this.args.width
			, this.args.falling
				? [Math.PI,0,0][dir+1]
				: this.realAngle + [0,0,Math.PI][dir+1]
			, startPoint
			, scanActors ? this.findSolid : this.findSolidTile
		);
	}

	scanBottomEdge(direction = 1)
	{
		const tileMap = this.viewport.tileMap;

		const radius = this.args.width / 2;

		const leftCorner = tileMap.getSolid(this.x - radius, this.y - 1, this.args.layer);
		const rightCorner = tileMap.getSolid(this.x + radius, this.y - 1, this.args.layer);

		if(leftCorner && rightCorner)
		{
			return;
		}

		return this.castRay(
			this.args.width
			, (direction < 0 ? Math.PI : 0)
			, [-direction * radius, 0]
			, (i,point) => {
				const actors = this.viewport
					.actorsAtPoint(point[0], point[1])
					.filter(a => a.args !== this.args);

				if(!actors.length && !tileMap.getSolid(point[0], point[1] + 1, this.args.layer))
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
			this.args.height + 1
			, Math.PI / 2
			, [direction * this.args.width / 2, -this.args.height]
			, (i,point) => {

				const actors = this.viewport
					.actorsAtPoint(point[0], point[1])
					.filter(a => a.args !== this.args);

				if(actors.length || tileMap.getSolid(point[0], point[1], this.args.layer))
				{
					return i;
				}
			}
		);
	}

	get realAngle()
	{
		if(!this.args.falling && this.args.standingOn)
		{
			return this.args.standingOn.realAngle;
		}

		const groundAngle = Number(this.args.groundAngle);

		if(this.args.falling)
		{
			return -groundAngle - (Math.PI);
		}

		let trajectory;

		switch(this.args.mode)
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
		switch(this.args.mode)
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
		switch(this.args.mode)
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
		switch(this.args.mode)
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
		switch(this.args.mode)
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
		switch(this.args.mode)
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
			const actors = this.viewport.actorsAtPoint(x,y).filter(x => {
				if(x.args === this.args)
				{
					return false;
				}

				if(!x.solid)
				{
					return false;
				}

				if(x.args.platform || x.isVehicle)
				{
					if(this.y <= x.y + -x.args.height && this.args.ySpeed >= 0)
					{
						return true;
					}

					return false;
				}

				return true;
			});

			if(actors.length > 0)
			{
				return actors;
			}
		}

		const tileMap = this.viewport.tileMap;

		return tileMap.getSolid(x, y, this.args.layer);
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

	get x() { return this.args.x }
	get y() { return this.args.y }
	get point() { return [this.args.x, this.args.y] }
	get rotateLock() { return false; }
	get controllable() { return false; }
	get skidding() { return Math.abs(this.args.gSpeed) && Math.sign(this.args.gSpeed) !== this.args.direction }

	effect(other)
	{

	}

	readInput()
	{
		if(!this.controller)
		{
			return;
		}

		const controller = this.controller;

		this.xAxis = 0;
		this.yAxis = 0;

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

		this.buttons = buttons;

		// if(this.args.ignore > 0)
		// {
		// 	this.xAxis = 0;
		// 	this.yAxis = 0;
		// }

		for(const i in buttons)
		{
			const button = buttons[i];

			const release = `release_${i}`;
			const press   = `command_${i}`;
			const hold    = `hold_${i}`;

			if((i == 0 && button.delta === 1) || !this.args.standingOn || !this.args.standingOn.isVehicle)
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
				this.args.flying  = false;

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
		if(this.args.hangingFrom && this.args.hangingFrom.unhook)
		{
			const drag = this.getLocalDrag();

			this.args.ySpeed = -this.args.jumpForce * drag * 0.75;

			this.args.hangingFrom.unhook();

			return;
		}

		if(this.args.falling || this.willJump || this.args.dontJump)
		{
			if(this.args.standingOn && !this.args.standingOn.isVehicle)
			{
				if(this.args.ignore && this.args.ignore !== -4)
				{
					return;
				}

				this.viewport.auras.delete(this.args.standingOn);
				this.willJump = true;
				return;
			}
		}

		if(!this.willJump)
		{
			if(this.yAxis < 0)
			{
				this.ignores.set(this.args.standingOn, 15);

				this.args.ignore = 0;
			}

			this.willJump = true;
		}
	}

	command_1()
	{
		if(this.canRoll && this.args.gSpeed)
		{
			this.args.rolling = true;
		}
	}

	release_0()
	{
		if(this.args.float)
		{
			return;
		}

		if(this.args.jumping && this.args.ySpeed < -4)
		{
			this.args.ySpeed = -4;
			// this.args.ySpeed *= 0.5;
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

			this.twister.render(this.twistFilter.node);

			this.onRemove(() => this.twistFilter.remove());
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

			this.pincherBg.render(this.pinchFilterBg);

			this.onRemove(() => this.pinchFilterBg.remove());
		}

		this.pincherBg.args.scale = warpBg;
	}

	droop(warpFactor = 0, xPosition = 0)
	{
		const half = this.args.width / 2;

		if(!this.drooperFg)
		{
			this.drooperFg = new Droop({
			id: 'droop-' + this.args.id
				, width: this.args.width * 3
				, height: this.args.height * 3
				, scale: 64
			});

			this.args.bindTo(['x', 'y'], (v,k) => {
				this.drooperFg.args[k] = Number(v);
			});

			this.onNextFrame(() => {
				this.drooperFg.args.scale = Number(warpFactor * 2);

				this.sprite.style({
					transform: `translate(-50%, calc(${warpFactor}px + calc(-100% + 1px)))`
					, filter:  `url(#droop-${this.args.id})`
				});

				this.drooperFg.args.dx = -xPosition;
			});

			this.drooperFg.render(this.sprite);

			return;
		}

		this.drooperFg.args.scale = Number(warpFactor * 2);

		this.sprite.style({
			transform: `translate(-50%, calc(${warpFactor}px + calc(-100% + 1px)))`
			, filter:  `url(#droop-${this.args.id})`
		});

		const widthFactor = 1 - xPosition / half;
		const posFactor   = xPosition / this.args.width;

		this.drooperFg.args.droopWidthLeft  = `${51 * widthFactor + 1}%`;
		this.drooperFg.args.droopRightStart = `${51 * widthFactor}%`;
		this.drooperFg.args.droopWidthRight = `${102 + -51 * widthFactor}%`;
	}

	crossRegionBoundary(region)
	{
		if(!region || this.args.static)
		{
			return;
		}

		// const drag = region.args.drag;

		// this.args.xSpeed *= drag;
		// this.args.ySpeed *= drag;
		// this.args.gSpeed *= drag;

		if(this.viewport)
		{
			const viewport = this.viewport;

			if(!this.args.gone && region.entryParticle)
			{
				const splash = new Tag(region.entryParticle);

				if(splash.node)
				{
					splash.style({
						'--x': this.x + this.args.xSpeed,
						'--y': region.y + -region.args.height + -8
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

	die()
	{
		if(this.args.dead)
		{
			return;
		}

		this.args.groundAngle = 0;

		this.args.ySpeed = 0;
		this.args.xSpeed = 0;

		this.args.jumping = false;
		this.args.falling = true;
		this.args.ignore  = -1;
		this.args.float   = 0;

		this.args.rings = 0;

		this.args.standingLayer = null;
		this.args.standingOn    = null;
		this.lastLayer          = null;

		this.args.dead = true;
		this.noClip = true;

		this.args.ySpeed = -12;
		this.args.xSpeed = 0;

		// this.onNextFrame(()=>{
		// 	this.args.ySpeed = -8;
		// 	this.args.xSpeed = 0;
		// });

		this.viewport.onFrameOut(120, () => {
			if(!this.args.dead)
			{
				return;
			}
			this.respawn();
		});
	}

	respawn()
	{
		if(!this.viewport)
		{
			return;
		}

		this.args.xSpeed = 0;
		this.args.ySpeed = 0;
		this.args.gSpeed = 0;

		this.args.respawning = true;
		this.args.display    = 'none';

		this.args.x = -this.viewport.args.x;
		this.args.y = -this.viewport.args.y;

		this.args.standingLayer = null;
		this.args.standingOn    = null;

		this.lastLayer = null;
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
			-5 * this.args.direction
			, -14 + this.args.height
		);
	}

	registerDebug(name)
	{
		window[name] = this;
	}

	loseRings(count = 0, age = 0)
	{
		const Ring = this.viewport.objectPalette['ring'];

		this.spawnRings = this.spawnRings || 0;

		const maxSpawn = count || Math.min(this.args.rings, 18);

		let current = 0;
		const toSpawn = maxSpawn - this.spawnRings;
		const circles = Math.floor(maxSpawn / 8);

		while(this.spawnRings < maxSpawn)
		{
			const ring = new Ring;

			const circle = Math.ceil(circles * current / maxSpawn);
			const angle  = (current % 8) * (Math.PI * 4 * circle) / maxSpawn;
			const radius = 1 * circle;

			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			ring.args.x = this.x - cos * (circle * 8);
			ring.args.y = this.y - sin * (circle * 8) - (this.args.height / 4);

			ring.args.xSpeed = 0;
			ring.args.ySpeed = -1;

			ring.noClip = true;

			ring.args.static  = false;
			ring.args.float   = 18;
			ring.args.ignore  = 30;

			ring.args.width  = 16;
			ring.args.height = 16;

			ring.dropped = true;

			this.viewport.onFrameOut(3 + (this.spawnRings % 3), () => {
				this.viewport.spawn.add({object:ring});
			});

			this.spawnRings++;
	 		current++;

			// ring.args.xSpeed = this.args.xSpeed || this.args.gSpeed;
			// ring.args.ySpeed = this.args.ySpeed;

			this.viewport.onFrameOut(6 * circle, () => {
				ring.args.xSpeed += -cos * circle + (-0.5 + Math.random()) * 3;
				ring.args.ySpeed += -sin * circle + (-0.5 + Math.random()) * 3;
			});

			if(current % 3 === 1)
			{
				ring.args.decoration = true;
				ring.noClip = true;

				this.viewport.onFrameOut(120, () => {
					this.viewport.actors.remove(ring);
					if(this.spawnRings > 0)
					{
						this.spawnRings--;
					}
				});
			}
			else
			{
				ring.args.decoration = false;
				ring.noClip = false;

				this.viewport.onFrameOut(age || 360 - (current % 5) * 35, () => {
					this.viewport.actors.remove(ring);

					if(this.spawnRings > 0)
					{
						this.spawnRings--;
					}
				});
			}
		}
	}

	collect(pickup)
	{
		if(pickup.dropped)
		{
			if(this.spawnRings)
			{
				this.spawnRings--;
			}

			pickup.dropped = false;
		}
	}

	angleTo(actor)
	{
		return Math.atan2(this.y - actor.y, this.x - actor.x);
	}

	distanceTo(actor)
	{
		return Math.sqrt((this.y - actor.y)**2 + (this.x - actor.x)**2);
	}

	setTile()
	{
		this.viewport.tileMap.ready.then(event => {

			const tile = this.viewport.tileMap.getTile(this.args.tileId-1);

			if(!tile)
			{
				return;
			}

			this.args.spriteX = tile[0];
			this.args.spriteY = tile[1];

			this.args.spriteSheet = tile[2] || this.args.spriteSheet;
		});
	}

	halt(frameOut)
	{
		const hSpeed = this.args.hSpeed = this.args.gSpeed;

		this.args.gSpeed = 0;

		this.viewport.onFrameOut(frameOut, () => {
			this.args.gSpeed = hSpeed;
			this.args.hSpeed = 0;
		});
	}
}
