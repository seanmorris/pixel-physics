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
import { SuperSheild }    from '../powerups/SuperSheild';
import { BubbleSheild }   from '../powerups/BubbleSheild';
import { NormalSheild }   from '../powerups/NormalSheild';
import { ElectricSheild } from '../powerups/ElectricSheild';
import { StarSheild }     from '../powerups/StarSheild';

import { LayerSwitch } from './LayerSwitch';
import { Layer } from '../viewport/Layer';

import { Platformer } from '../behavior/Platformer';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

const WALKING_SPEED  = 100;
const RUNNING_SPEED  = Infinity;
const CRAWLING_SPEED = 1;

const JUMP_FORCE     = 15;

const DEFAULT_GRAVITY = MODE_FLOOR;

const BOUNDS = Symbol('BOUNDS');

export class PointActor extends View
{
	static lastClick = 0;

	template = `<div class  = "point-actor [[type]]">
		<div class = "sprite" cv-ref = "sprite"></div>
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

		const others = {};

		for(const i in objDef.properties)
		{
			const property = objDef.properties[i];

			if(objDef.properties[i].type === 'object')
			{
				others[ property.name ] = property.value;
				// continue;
			}

			objArgs[ property.name ] = property.value;

			def.set(property.name, property.value);
		}

		objArgs.tileId = objDef.gid;

		const instance =  new this(Object.assign({}, objArgs));

		instance.others = others;

		instance.def = def;
		instance.objDef = objDef;

		instance.args.float = instance.float ?? instance.args.float;

		return instance;
	}

	constructor(args = {}, parent)
	{
		args[ Bindable.NoGetters ] = true;

		super(args, parent);

		this[ Bindable.NoGetters ] = true;

		Object.defineProperty(this.nodes, Bindable.NoGetters, {value:true});

		this.defaultDisplay = 'initial';

		this.others = {};
		this.otherDefs = {};

		this.springing = false;

		this.stepCache = {};

		this.fallTime    = 0;
		this.idleTime    = 0;
		this.groundTime  = 0;

		this.locked = 0;

		this.xHold = 12;
		this.yHold = 12;

		this.args.weight = this.args.weight ?? 100;
		this.args.score  = 0;
		this.args.rings  = 0;

		this.args.mercy = false;
		this.args.stuck = false;
		this.args.R = 0;
		this.args.popChain = [];

		this.args.canHide = false;

		this.args.opacity = this.args.opacity ?? 1;
		this.args.pushing = false;

		this.autoStyle = new Map;
		this.autoAttr  = new Map;
		this.hanging   = new Map;
		this.ignores   = new Map;

		this.regions   = new Set;
		this.powerups  = new Set;
		this.behaviors = new Set;

		this.behaviors.add(new Platformer);

		this.lastPointA = [];
		this.lastPointB = [];

		this.carrying = new Set;

		this.inventory = new Classifier([
			Sheild
			, FireSheild
			, BubbleSheild
			, ElectricSheild
			, NormalSheild
		]);

		this.splashes = new Set;

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

			if(this.controllable)
			{
				const hasKey = `has${item.type[0].toUpperCase() + item.type.substr(1)}`;
				this.viewport.args[hasKey] = hasKey;
			}

			item.acquire && item.acquire(this);

			if(!(this.args.currentSheild instanceof StarSheild))
			{
				this.args.currentSheild = item;
				item.equip && item.equip(this);
			}
		});

		this.inventory.addEventListener('removing', event => {

			const item = event.detail.object;

			this.powerups.delete(item);

			if(this.controllable)
			{
				const hasKey = `has${item.type[0].toUpperCase() + item.type.substr(1)}`;
				this.viewport.args[hasKey] = null;
			}

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

		// Object.defineProperty(this, 'public', {value: {}});

		// this.args.bindTo((v,k) => {
		// 	this.public[k] = v;
		// });

		this.args.type = 'actor-generic';
		this.args.modeTime = 0;

		this.args.charStrings = [];

		this.args.display = this.args.display || 'initial';

		this.args.rings = 0;
		this.args.coins = 0;

		this.args.emeralds = 0;
		this.args.emblems  = [];
		this.args.emblemsCurrent = [];

		this.args.dead  = false;
		this.args.respawning = false;

		this.ringSet = new Set;
		this.ringDoc = new DocumentFragment;

		this.args.yMargin = 0;

		this.args.cameraMode = 'normal';
		this.args.cameraBias = 0;

		this.args.layer  = this.args.layer ?? 1;
		this.args.active = this.args.active ?? false;
		this.args.moving = false;

		this.args.flySpeedMax = 40;

		this.args.x = this.args.x || 1024 + 256;
		this.args.y = this.args.y || 32;
		this.args.z = this.args.z || 0;

		this.args.xOff = 0;
		this.args.yOff = 0;

		this.args.width  = this.args.width  || 1;
		this.args.height = this.args.height || 1;

		this.args.direction = Number(this.args.direction) || 1;
		this.args.heading   = 0;

		this.args.xSpeed = this.args.xSpeed || 0;
		this.args.ySpeed = this.args.ySpeed || 0;

		this.args.gSpeed = this.args.gSpeed || 0;
		this.args.hSpeed = 0;
		this.args.xSpeed = this.args.xSpeed || 0;
		this.args.ySpeed = this.args.ySpeed || 0;
		this.args.angle  = this.args.angle  || 0;

		this.args.groundAngle  = this.args.groundAngle || 0;
		this.args.displayAngle = 0;
		this.args.airAngle     = 0;

		const lastAngles = [];
		Object.defineProperty(lastAngles, Bindable.NoGetters, {value: true});
		this.lastAngles = lastAngles

		this.angleAvg   = 16;

		this.args.xSpeedMax = 512;
		this.args.ySpeedMax = 512;
		this.args.gSpeedMax    = WALKING_SPEED;
		this.args.rollSpeedMax = 23;
		this.args.gravity   = this.args.gravity ?? 0.65;
		this.args.decel     = 0.85;
		this.args.accel     = 0.2;
		this.args.airAccel  = 0.3;
		this.args.jumpForce = 14;

		this.args.airTimeTotal = 0;
		this.args.groundTimeTotal = 0;

		this.args.jumping  = false;
		this.args.jumpedAt = null;
		this.args.deepJump = false;
		this.args.highJump = false;

		this.maxStep   = 11;
		this.backStep  = 0;
		this.frontStep = 0;

		this.args.rolling = false;
		this.args.sliding = false;

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
		this.args.antiSkid = this.args.antiSkid || 0;
		this.args.halted = this.args.halted || 0;
		this.args.ignore = this.args.ignore || 0;
		this.args.float  = this.args.float  || 0;

		this.colliding = false;

		this.args.flyAngle = 0;

		this.standingUnder = new Set;

		this[BOUNDS] = false;

		this.args.bindTo(['mode', 'falling'], () => {
			this.args.modeTime = 0;
			this[BOUNDS] = false;
		});

		this.args.bindTo(['x','y'], (v, k, t) => {
			this[BOUNDS] = false;
			isNaN(v) && console.trace(k, v)
			this.stepCache = {};
			this.idleTime = 0;
		});

		this.args.bindTo(['width','height'], (v, k, t) => {
			this[BOUNDS] = false;
		});

		this.args.bindTo(['xSpeed','ySpeed'], (v, k, t) => {
			isNaN(v) && console.trace(k, v)
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
		this.debindGroundA = null;
		this.debindGroundL = null;

		this.args.name = this.args.name ?? '';

		if(this.controllable)
		{
			this.controller = new Controller({deadZone: 0.2});

			// this.args.charStrings = [
			// 	new CharacterString({value: this.args.name ?? ''})
			// ];

			this.controller.zero();
		}

		this.debindGroundX = new Set;
		this.debindGroundY = new Set;
		this.debindGroundA = new Set;
		this.debindGroundL = new Set;

		this.args.bindTo('standingOn', (groundObject,key,target,previous) => {

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

			for(const debind of this.debindGroundA)
			{
				this.debindGroundA.delete(debind);

				debind();
			}

			for(const debind of this.debindGroundL)
			{
				this.debindGroundL.delete(debind);

				debind();
			}

			const prevGroundObject = target[key];

			if(prevGroundObject)
			{
				if(prevGroundObject.isVehicle)
				{
					prevGroundObject.occupant  = null;
					prevGroundObject.stayStuck = false;
					prevGroundObject.willStick = false;

					prevGroundObject.xAxis = 0;
					prevGroundObject.yAxis = 0;

					prevGroundObject.args.active = false;
				}

				prevGroundObject.standingUnder && prevGroundObject.standingUnder.delete(this);
			}

			const Switch = this.viewport.objectPalette['switch'];

			if(this.controllable)
			{
				if(prevGroundObject && !(prevGroundObject instanceof Switch))
				{
					prevGroundObject.args.active = false;
					this.viewport.auras.delete(prevGroundObject);
				}

				if(groundObject && !(groundObject instanceof Switch))
				{
					groundObject.args.active = true;
				}
			}

			if(!groundObject)
			{
				this.viewport.auras.delete(this.args.standingOn);
				return;
			}

			groundObject.standingUnder.add(this);

			if(this.controllable && groundObject.isVehicle && !groundObject.dead)
			{
				if(!this.args.gSpeed)
				{
					this.args.pushing = false;
				}

				groundObject.args.active = true;

				const debindGroundX = groundObject.args.bindTo('x', (vv,kk) => {
					const x = groundObject.args.direction * groundObject.args.seatForward || 0;
					const y = groundObject.args.seatHeight || groundObject.args.height || 0;

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

					const [xRot, yRot] = groundObject.rotatePoint(x, y);

					this.args.x = xRot + groundObject.x;
					this.args.y = yRot + vv;
				});

				// const debindGroundA = groundObject.args.bindTo('groundAngle', (vv,kk) => {

				// 	if(this.args.jumping)
				// 	{
				// 		return;
				// 	}

				// 	const x = groundObject.args.direction * groundObject.args.seatForward || 0;
				// 	const y = groundObject.args.seatHeight || groundObject.args.height || 0;

				// 	const [xRot, yRot] = groundObject.rotatePoint(x, y);

				// 	this.args.x = xRot + groundObject.x;
				// 	this.args.y = yRot + groundObject.y;
				// });

				const debindGroundL = groundObject.args.bindTo('layer', (vv,kk) => {
					this.args.layer = vv;
				});

				this.debindGroundX.add(debindGroundX);
				this.debindGroundY.add(debindGroundY);
				// this.debindGroundA.add(debindGroundA);
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
				if(this.args.y <= this.args.height + groundObject.args.y - groundObject.args.height)
				{
					const debindGroundX = groundObject.args.bindTo('x', (vv,kk) => {
						const solid = groundObject.getMapSolidAt(this.args.x + vv + -groundObject.args.x, this.args.y);

						if(solid)
						{
							return;
						}

						this.args.x += vv + -groundObject.args.x
					});

					const debindGroundY = groundObject.args.bindTo('y', (vv,kk) => {
						const newY = vv + -groundObject.args.height + ((this.controllable || this.isPushable) ? 0 : 0);

						const solid = groundObject.getMapSolidAt(this.args.x, newY);

						if(solid)
						{
							return;
						}

						this.args.y = newY;
					});

					const debindGroundL = groundObject.args.bindTo('layer', (vv,kk) => {
						this.args.layer = vv;
					});

					this.debindGroundX.add(debindGroundX);
					this.debindGroundY.add(debindGroundY);
					this.debindGroundL.add(debindGroundL);

					if(!groundObject.args.treadmill)
					{
						this.args.gSpeed -= groundObject.args.gSpeed;
					}
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
		this.sprite = this.findTag('div.sprite');
		this.box    = this.findTag('div');

		this.autoStyle.set(this.box, {
			display:              'display'
			, '--animation-bias': 'animationBias'
			, '--bg-filter':      'bgFilter'
			, '--sprite-sheet':   'spriteSheetUrl'
			, '--direction':      'direction'
			, '--sprite-x':       'spriteX'
			, '--sprite-y':       'spriteY'
			, '--angle':          'angle'
			, '--palletShift':    'palletShift'
			, '--fly-angle':      'flyAngle'
			, '--display-angle':  'groundAngle8'
			, '--ground-angle':   'groundAngle8'
			, '--ground-angle8':  'groundAngle8'
			, '--air-angle':      'airAngle'
			, '--corkscrew':      'corkscrew'
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
			, 'data-direction': 'direction'
			, 'data-respawning':'respawning'
			, 'data-animation':' animation'
			, 'data-heading':   'heading'
			, 'data-super':     'isSuper'
			, 'data-hyper':     'isHyper'
			, 'data-mercy':     'mercy'
			, 'data-selected':  'selected'
			, 'data-following': 'following'
			, 'data-carrying':  'carrying'
			, 'data-falling':   'falling'
			, 'data-moving':    'moving'
			, 'data-pushing':   'pushing'
			, 'data-facing':    'facing'
			, 'data-filter':    'filter'
			, 'data-angle':     'angleDeg'
			, 'data-driving':   'driving'
			, 'data-active':    'active'
			, 'data-layer':     'layer'
			, 'data-dead':      'dead'
			, 'data-mode':      'mode'
			, 'data-netplayer': 'netplayer'
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

		if(this.init || !this.viewport)
		{
			return;
		}

		const regionClass = this.viewport.objectPalette['base-region']

		this.isRegion = this instanceof regionClass;

		this.args.bindTo('spriteSheet', v => {
			if(v !== undefined)
			{
				this.args.spriteSheetUrl = this.urlWrap(v)
			}
			else
			{
				this.args.spriteSheetUrl = undefined;
			}
		});

		this.args.bindTo('angle', v => this.args.angleDeg = this.rad2deg(v));

		this.args.charStrings.bindTo(v => {
			if(!this.labels && this.args.charStrings.length)
			{
				this.labels = View.from(
					'<div class = "labels" cv-ref = "labels" cv-each = "charStrings:charString:c">[[charString]]</div>'
					, {charStrings: this.args.charStrings}
				);
				this.labels.render(this.sprite);
			}
			else if(this.labels && !this.args.charStrings.length)
			{
				this.labels.remove();
				this.labels = null;
			}
		}, {wait:0});


		if(this.controllable)
		{
			const superSheild = new SuperSheild;

			superSheild.equip(this);

			this.inventory.add(superSheild);
		}

		this.init = true;

		this.args.bindTo('animation', (v,k,t,d,p) => {
			// const animations = this.box.getAnimations({subtree:true});
			// animations.forEach(animation => animation.cancel());
			this.box.setAttribute('data-animation', v);
		});

		if(this.controllable)
		{
			this.sprite.parentNode.classList.add('controllable');
		}

		for(const behavior of this.behaviors)
		{
			behavior.rendered && behavior.rendered(Bindable.make(this));
		}
	}

	updateStart()
	{
		if(this.args.dead)
		{
			this.args.xSpeed = 0;
		}

		for(const behavior of this.behaviors)
		{
			behavior.updateStart && behavior.updateStart(this);
		}
	}

	updateEnd()
	{
		for(const behavior of this.behaviors)
		{
			behavior.updateEnd && behavior.updateEnd(this);
		}

		if(this.viewport && this.viewport.args.frameId % this.viewport.settings.frameSkip !== 0)
		{
			return;
		}

		const lastFocus = this.focused;

		if(!this.args.falling)
		{
			this.focused = false;
		}

		for(const region of this.regions)
		{
			if(region.focus)
			{
				this.viewport.auras.add(region.focus);

				this.focused = region.focus;
			}
		}

		if(lastFocus !== this && lastFocus !== this.focused)
		{
			this.viewport && this.viewport.auras.delete(lastFocus);
		}

		this.args.groundAngle8 = this.args.groundAngle;

		if(!this.isVehicle
			&& !this.args.falling
			&& !this.args.grinding
			&& this.args.mode === 0
			&& Math.abs(this.args.groundAngle8) <= ((Math.PI / 8) + 0.01))
		{
			this.args.groundAngle8 = 0;
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

		for(const splash of this.splashes)
		{
			splash.x += this.args.xSpeed * (1-(splash.age / 30));
			splash.style({'--x': splash.x});
			splash.age++;
		}
	}

	update()
	{
		if(this.locked > 0)
		{
			this.locked--;
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

		for(const behavior of this.behaviors)
		{
			behavior.update && behavior.update(this);
		}
	}

	getLocalDrag()
	{
		if(this.args.dead)
		{
			return 1;
		}

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

	getLocalFriction()
	{
		let friction = 1;

		for(const region of this.regions)
		{
			if(region.skimmers.has(this) || region.skimmers.has(Bindable.make(this)))
			{
				continue;
			}

			if(!region.args.friction && region.args.friction !== 0)
			{
				continue;
			}

			if(region.args.friction < friction)
			{
				friction = region.args.friction;
			}
		}

		return friction;
	}

	setCameraMode()
	{
		if(!this.viewport)
		{
			return;
		}

		if(this.args.cameraIgnore)
		{
			return;
		}

		if(this.focused)
		{
			this.args.cameraMode = 'panning';
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
			if(this.args.mode && !this.args.falling && this.args.rolling && this.args.jumpBlocked)
			{
				this.args.cameraMode = 'tube';
			}
			else if(!this.args.falling || this.getMapSolidAt(this.args.x, this.args.y + 24))
			{
				const forwardSolid = this.getMapSolidAt(this.args.x + 32 * this.args.direction, this.args.y + 24);
				const forwardDeepSolid = this.getMapSolidAt(this.args.x + 32 * this.args.direction, this.args.y + 96);
				const underSolid   = this.getMapSolidAt(this.args.x + 0  * this.args.direction, this.args.y + 48);

				if(this.args.mode === MODE_FLOOR && this.args.groundAngle === 0)
				{
					if(Math.abs(this.args.groundAngle) < Math.PI / 4)
					{
						if(!underSolid && forwardSolid && !this.args.grinding && !this.args.skimming)
						{
							this.args.cameraMode = 'bridge';
						}
						else if(!forwardSolid && !forwardDeepSolid && !this.args.grinding && !this.args.skimming)
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
					this.args.cameraMode = 'normal';
				}
			}
			else
			{
				if(this.getMapSolidAt(this.args.x + 0  * this.args.direction, this.args.y + 64))
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
						&& !this.getMapSolidAt(this.args.x, this.args.y + 480)
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

		if(other.args.y <= this.args.y - this.args.height)
		{
			this.args.collType = 'collision-top';

			type = 0;
		}
		else if(other.args.x < this.args.x - Math.floor(this.args.width/2))
		{
			this.args.collType = 'collision-left';

			type = 1;
		}
		else if(other.args.x >= this.args.x + Math.floor(this.args.width/2))
		{
			this.args.collType = 'collision-right';

			type = 3;
		}
		else if(other.args.y >= this.args.y)
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
			if(!this.args.rolling && !this.yAxis && !this.spindashCharge)
			{
				const axisSign = Math.sign(xAxis);
				const sign     = Math.sign(gSpeed);
				const friction = this.getLocalFriction();
				let gSpeed     = this.args.gSpeed;

				if(!this.args.rolling  && !this.args.sliding && !this.args.climbing && !this.args.ignore && !this.args.wallSticking)
				{
					if(axisSign === sign || !sign)
					{
						gSpeed += xAxis * friction * this.args.accel * drag;

						if(Math.abs(axisSign - sign) === 2)
						{
							this.args.ignore = 10;
						}
					}
					else if(!this.args.ignore && !this.args.antiSkid)
					{
						gSpeed += xAxis * friction * this.args.accel * drag * this.args.skidTraction;
					}
				}

				// if(Math.abs(gSpeed) > gSpeedMax)
				// {
				// 	gSpeed = gSpeedMax * Math.sign(gSpeed);
				// }

				if(!Math.sign(this.args.gSpeed) || Math.sign(this.args.gSpeed) === Math.sign(gSpeed))
				{
					if(this.args.pushing && Math.sign(xAxis) !== Math.sign(this.args.pushing))
					{
						this.args.gSpeed = 0;
					}
					else if(!xAxis || Math.abs(gSpeed) < gSpeedMax || Math.sign(gSpeed) !== Math.sign(xAxis))
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

		if(xAxis < 0 && (this.args.gSpeed || this.args.stuck) && !this.args.ignore)
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

		if(xAxis > 0 && (this.args.gSpeed || this.args.stuck) && !this.args.ignore)
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

		if(this.args.currentSheild instanceof StarSheild)
		{
			return;
		}

		if(this.aAxis < -0.75)
		{
			if(this.inventory.has(ElectricSheild))
			{
				this.args.currentSheild = [...this.inventory.get(ElectricSheild)][0];
			}
			else
			{
				this.args.currentSheild = '';
			}
		}

		if(this.aAxis > +0.75)
		{
			if(this.inventory.has(FireSheild))
			{
				this.args.currentSheild = [...this.inventory.get(FireSheild)][0];
			}
			else
			{
				this.args.currentSheild = '';
			}
		}

		if(this.bAxis < -0.75)
		{
			if(this.inventory.has(BubbleSheild))
			{
				this.args.currentSheild = [...this.inventory.get(BubbleSheild)][0];
			}
			else
			{
				this.args.currentSheild = '';
			}
		}

		if(this.bAxis > +0.75)
		{
			if(this.inventory.has(NormalSheild))
			{
				this.args.currentSheild = [...this.inventory.get(NormalSheild)][0];
			}
			else
			{
				this.args.currentSheild = '';
			}
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
			const x = this.args.x + offset[0] + (i * Math.cos(angle));
			const y = this.args.y + offset[1] + (i * Math.sin(angle));

			// window.logPoints && window.logPoints(x, y, 'mode-' + this.args.mode);

			const bottom  = [x, y];

			const retVal = callback(i, bottom, this);

			if(retVal !== undefined)
			{
				return retVal;
			}
		}

		return false;
	}

	castRayQuick(length, angle, offset = [0,0], collides = true)
	{
		if(!this.viewport || !this.viewport.tileMap)
		{
			return;
		}

		const thisPoint = [this.args.x + offset[0], this.args.y + offset[1]];

		const solidPoint = this.viewport.tileMap.castRay(
			thisPoint[0]
			, thisPoint[1]
			, angle
			, length
			, this.args.layer
		);

		let magnitude = length;

		if(solidPoint)
		{
			magnitude = Math.hypot(
				(thisPoint[0] - solidPoint[0])
				, (thisPoint[1] - solidPoint[1])
			);
		}

		const endPoint = [
			thisPoint[0] + Math.cos(angle) * magnitude
			, thisPoint[1] + Math.sin(angle) * magnitude
		];

		const actorsAtLine = this.viewport.actorsAtLine(
			thisPoint[0]
			, thisPoint[1]
			, endPoint[0]
			, endPoint[1]
		);

		actorsAtLine.delete(this);

		const collisions = new Map;

		if(collides)
		{
			for(const [actor, collision] of actorsAtLine)
			{
				if(actor.callCollideHandler(this) !== false)
				{
					collisions.set(actor, collision);
				}
			}
		}

		for(const [actor, collision] of collisions)
		{
			if(collision.distance > magnitude)
			{
				continue;
			}

			if(this.checkSolidActors(actor))
			{
				return Math.round(collision.distance);
			}
		}

		if(solidPoint)
		{
			return magnitude;
		}

		return false;
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
			return Math.round(Math.floor(deg * 10) / 10);
		}

		return Math.round(Math.ceil(deg * 10) / 10);
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

		const cells = viewport.getNearbyColCells(this.args.x, this.args.y);

		let closest = null;
		let minDist = Infinity;

		for(const cell of cells)
		{
			for(const actor of cell)
			{
				if(actor === this)
				{
					continue;
				}

				if(actor.args.gone)
				{
					continue;
				}

				if(!selector(actor))
				{
					continue;
				}

				const distance = this.distanceFrom(actor);

				if(Math.abs(distance) > maxDistance)
				{
					continue;
				}

				if(distance < minDist)
				{
					closest = actor;
					minDist = distance;
				}
			}
		}

		return closest;

		// const actors = new Map;

		// cells.map(s => s.forEach(a =>{

		// 	if(a === this)
		// 	{
		// 		return;
		// 	}

		// 	if(a.args.gone)
		// 	{
		// 		return;
		// 	}

		// 	if(!selector(a))
		// 	{
		// 		return;
		// 	}

		// 	const distance = this.distanceFrom(a);
		// 	const angle    = Math.atan2(a.y - this.y, a.args.x - this.args.x);

		// 	if(Math.abs(distance) > maxDistance)
		// 	{
		// 		return;
		// 	}

		// 	actors.set(distance, a);
		// }));

		// const distances = [...actors.keys()];
		// const shortest  = Math.min(...distances);

		// const closest = actors.get(shortest);

		// return closest;
	}

	immune(other, type = 'normal')
	{
		// if(this.args.mercy)
		// {
		// 	return true;
		// }

		const shield = this.args.currentSheild;

		if(shield && shield.immune && shield.immune(this, other, type))
		{
			return true;
		}

		return false;
	}

	totalCombo(fail = false)
	{
		if(!this.args.popChain.length)
		{
			return;
		}

		if(this.eraseCombo)
		{
			this.eraseCombo();
			this.eraseCombo = false;
		}

		this.args.popCombo = 0;

		let multiply = 0;
		let base = 0;

		for(const pop of this.args.popChain)
		{
			multiply += pop.multiplier;
			base += pop.points;
		}

		const total = base * multiply;

		this.args.popChain.length = 0;

		if(!total)
		{
			this.viewport.args.comboResult = null;
			this.viewport.args.comboFail = null;
			return;
		}

		this.eraseCombo = this.viewport.onFrameOut(360, () => {
			this.viewport.args.comboResult = null;
			this.viewport.args.comboFail = null;
		});

		if(fail)
		{
			this.viewport.args.comboFail = new CharacterString({value:total, color:'red-light'});
			this.viewport.args.comboResult = null;
			return;
		}

		this.viewport.args.comboResult = new CharacterString({value:'+'+total, color:'green-light'});
		this.viewport.args.comboFail = null;

		this.args.score += total;
	}

	damage(other, type = 'normal')
	{
		if(this.args.mercy)
		{
			return;
		}

		this.dashed = this.args.jumping = this.args.spinning = false;

		const damageEvent = new CustomEvent('damage', {cancelable:true, detail:{other,type}});

		if(this.isHyper)
		{
			return;
		}

		if(this.isSuper)
		{
			this.onNextFrame(()=> this.startle(other));
			this.args.mercy = 30;
			return;
		}

		if(!this.immune(other, type))
		{
			if(!this.dispatchEvent(damageEvent))
			{
				if(!damageEvent.detail.immune)
				{
					this.args.y -= 8;
					this.onNextFrame(()=> this.startle(other));
					this.args.mercy = 180;

					if(this.viewport.settings.rumble)
					{
						this.controller.rumble({
							duration: 350,
							strongMagnitude: 1.0,
							weakMagnitude: 1.0
						});
					}

					this.totalCombo(true);
					this.lightDashReward = this.grindReward = null;
				}

				return;
			}
		}
		else
		{
			return;
		}

		if(this.args.rings)
		{
			this.loseRings();
			this.args.rings = 0;
			this.onNextFrame(()=> this.startle(other));
			this.args.mercy = 180;
			this.totalCombo(true);

			if(this.viewport.settings.rumble)
			{
				this.controller.rumble({
					duration: 350,
					strongMagnitude: 1.0,
					weakMagnitude: 1.0
				});

				this.onTimeout(350, () => {
					this.controller.rumble({
						duration: 150,
						strongMagnitude: 0.5,
						weakMagnitude: 1.0
					});
				});
			}
		}
		else if(this.controllable)
		{
			this.die();

			this.totalCombo(true);

			if(this.viewport.settings.rumble)
			{
				this.controller.rumble({
					duration: 450,
					strongMagnitude: 1.0,
					weakMagnitude: 1.0
				});
			}
		}
	}

	startle(other)
	{
		if(this.noClip || this.args.startled > 30)
		{
			return;
		}

		const direction = Math.sign(
			other && (
				other.args.xSpeed
				|| (other.args.x - other.xLast)
				|| (other.args.x - this.args.x)
			)
			|| (this.x - this.xLast)
			|| this.args.xSpeed
			|| this.args.gSpeed
			|| this.args.direction
		);

		this.args.jumping  = false;
		this.args.falling  = true;
		this.args.startled = 180;
		this.args.ignore   = 30;
		this.args.float    = 1;

		this.args.xSpeed = -2.25 * direction;
		this.args.ySpeed = -8;

		this.args.x += this.args.xSpeed;

		this.args.flying = false;

		this.args.dashed   = false;
		this.args.lightDashed = false;
		this.args.lightDashing = false;

		this.args.gSpeed = 0;

		this.args.standingOn = false;

		if(this.args.mode === MODE_CEILING)
		{
			this.args.mode = 0;
			this.args.y += this.args.height;
			this.args.ySpeed = 4;
		}
		else
		{
			this.args.y -= 4;
		}
	}

	checkSolidActors(x)
	{
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
			if(this.args.y <= x.args.y + -x.args.height && this.args.ySpeed >= 0)
			{
				return true;
			}

			return false;
		}

		return true;
	}

	// findSolid(i, point, actor)
	// {
	// 	if(!actor.viewport)
	// 	{
	// 		return;
	// 	}

	// 	const viewport = actor.viewport;
	// 	const tileMap  = viewport.tileMap;

	// 	const actors = viewport.actorsAtPoint(point[0], point[1]);

	// 	for(const a of actors)
	// 	{
	// 		if(actor.checkSolidActors(a))
	// 		{
	// 			return i;
	// 		}
	// 	}

	// 	const solid = tileMap.getSolid(point[0], point[1], actor.args.layer, Math.sign(this.args.ySpeed));

	// 	if(actor.upScan)
	// 	{
	// 		actor.lastLayer = solid;
	// 	}

	// 	if(solid)
	// 	{
	// 		return i;
	// 	}
	// }

	// findSolidTile(i, point, actor)
	// {
	// 	if(!actor.viewport)
	// 	{
	// 		return;
	// 	}

	// 	const viewport = actor.viewport;
	// 	const tileMap  = viewport.tileMap;

	// 	const solid = tileMap.getSolid(point[0], point[1], actor.args.layer, Math.sign(this.args.ySpeed));

	// 	if(actor.upScan)
	// 	{
	// 		actor.lastLayer = solid;
	// 	}

	// 	if(solid)
	// 	{
	// 		return i;
	// 	}
	// }

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
				return [this.args.x + 0, this.args.y + 1];
				break;

			case MODE_RIGHT:
				return [this.args.x + 1, this.args.y + 0];
				break;

			case MODE_CEILING:
				return [this.args.x + 0, this.args.y - 1];
				break;

			case MODE_LEFT:
				return [this.args.x - 1, this.args.y + 0];
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

	filterSolidActors(x)
	{
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
			if(this.args.y >= x.args.y && this.args.ySpeed >= 0 && this.args.mode === 2)
			{
				return true;
			}

			if(this.args.y <= x.args.y + -x.args.height + 1 && this.args.ySpeed >= 0)
			{
				return true;
			}

			return false;
		}

		return true;
	}

	getMapSolidAt(x, y, actors = true)
	{
		if(!this.viewport)
		{
			return;
		}

		if(actors)
		{
			const actors = this.viewport
			.actorsAtPoint(x,y)
			.filter(this.filterSolidActors.bind(this));

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
	get skidding() {
		return Math.abs(this.args.gSpeed)
			&& !this.args.antiSkid
			&& !this.args.grinding
			&& Math.sign(this.args.gSpeed) !== this.args.direction
	}

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

		if(!controller.axes)
		{
			return;
		}

		if(controller.axes[0])
		{
			this.xAxis = controller.axes[0].magnitude;
		}

		if(controller.axes[1])
		{
			this.yAxis = controller.axes[1].magnitude;
		}

		// if(controller.axes[6] && controller.axes[6].magnitude)
		// {
		// 	this.xAxis = controller.axes[6].magnitude;
		// }
		// else if(controller.axes[0] && controller.axes[0].magnitude)
		// {
		// 	this.xAxis = controller.axes[0].magnitude;
		// }

		// if(controller.axes[7] && controller.axes[7].magnitude)
		// {
		// 	this.yAxis = controller.axes[7].magnitude;
		// }
		// else if(controller.axes[1] && controller.axes[1].magnitude)
		// {
		// 	this.yAxis = controller.axes[1].magnitude;
		// }

		if(0 && controller.axes[7])
		{
			if(controller.axes[3])
			{
				this.aAxis = controller.axes[3].magnitude;
			}

			if(controller.axes[4])
			{
				this.bAxis = controller.axes[4].magnitude;
			}
		}
		else
		{
			if(controller.axes[2])
			{
				this.aAxis = controller.axes[2].magnitude;
			}

			if(controller.axes[3])
			{
				this.bAxis = controller.axes[3].magnitude;
			}
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

			this.swing = false;

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
			if(this.yAxis < 0 || (this.args.standingOn && this.args.standingOn.quickDrop))
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

	command_11()
	{
		if(this.args.currentSheild && !(this.args.currentSheild instanceof StarSheild))
		{
			const item = this.args.currentSheild;
			item.unequip && item.unequip(this);

			this.args.currentSheild = null;
		}
	}

	release_0()
	{
		if(this.args.float)
		{
			return;
		}

		if(this.args.jumping && !this.lightDashed &&!this.dashed && this.args.ySpeed < -8)
		{
			this.args.ySpeed *= 0.5;
			return;
		}

		if(this.args.jumping && !this.lightDashed &&!this.dashed && this.args.ySpeed < -4)
		{
			this.args.ySpeed = -4;
			// this.args.ySpeed *= 0.5;
		}
	}

	distanceFrom({x,y})
	{
		return Math.hypot(this.x - x, this.y - y);
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

			this.twister.args.yOff = 16;

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

			if(!this.args.gone
				&& this.args.moving
				&& Math.abs(this.args.y - (region.args.y + -region.args.height)) <= Math.abs(this.args.ySpeed || this.args.gSpeed)
				&& region.entryParticle
			){
				const splash = new Tag(region.entryParticle);

				if(splash.node)
				{
					splash.age = 0;
					splash.x = this.args.x;
					splash.style({
						'--x': this.args.x,
						'--y': region.args.y + -region.args.height + -8
						, 'z-index': 5, opacity: Math.random
						, '--particleScale': this.args.particleScale
						, '--time': 320
					});

					this.splashes.add(splash);

					viewport.particles.add(splash);

					viewport.onFrameOut(20, () => {
						splash.node && viewport.particles.remove(splash)
						this.splashes.delete(splash);
					});
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

		this.args.currentSheild = null;

		this.totalCombo(true);

		this.args.groundAngle = 0;

		this.args.ySpeed = 0;
		this.args.xSpeed = 0;

		this.args.jumping = false;
		this.args.falling = true;
		this.args.ignore  = -1;
		this.args.mercy   = 0;
		this.args.float   = 0;

		this.args.rings = 0;

		this.args.standingLayer = null;
		this.args.standingOn    = null;
		this.lastLayer          = null;

		this.args.dead = true;
		this.noClip = true;

		this.args.ySpeed = -12;

		if(this.y > this.viewport.meta.deathLine)
		{
			this.args.ySpeed = -14;
		}

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

		const maxSpawn = count || Math.min(this.args.rings, 16);

		let current   = 0;
		const toSpawn = maxSpawn - this.spawnRings;
		const circles = Math.floor(maxSpawn / 8);

		this.viewport.onFrameOut(4, () => {
			while(this.spawnRings < maxSpawn)
			{
				const ring = new Ring;

				const circle = Math.ceil(current / 8);
				const angle  = (current % 8) * (Math.PI / 4) + (Math.PI / 4);
				const radius = 1 * circle;

				const cos = Math.cos(angle);
				const sin = Math.sin(angle);

				ring.args.x = this.x - cos * (circle * 8);
				ring.args.y = this.y - sin * (circle * 8) - (this.args.height / 4);

				ring.args.xSpeed = 0;
				ring.args.ySpeed = 0;

				ring.noClip = true;

				ring.args.static  = false;
				ring.args.float   = 18;
				ring.args.ignore  = 30;

				ring.args.width  = 16;
				ring.args.height = 16;

				ring.dropped = true;

				this.viewport.onFrameOut((1+circle) * 2, () => {
					this.viewport.spawn.add({object:ring});
				});

				this.spawnRings++;
		 		current++;

				// ring.args.xSpeed = this.args.xSpeed || this.args.gSpeed;
				// ring.args.ySpeed = this.args.ySpeed;

				this.viewport.onFrameOut(circle * 2 + 6, () => {
					ring.args.xSpeed += -cos * 3;
					ring.args.ySpeed += -sin * 3;

					ring.args.ySpeed += -(circle + 1) * 0.75;
				});

				if(current % 3 === 2)
				{
					ring.args.decoration = true;
					ring.noClip = true;

					this.viewport.onFrameOut(100, () => {
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
		});
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
		return Math.hypot(this.y - actor.y, this.x - actor.x);
		// return Math.sqrt((this.y - actor.y)**2 + (this.x - actor.x)**2);
	}

	canSee(actor)
	{
		const cast = this.castRayQuick(
			this.distanceTo(actor)
			, actor.angleTo({x: this.args.x, y: this.args.y - this.args.height})
			, [0,-this.args.height]
			, false
		);

		if(cast === false)
		{
			return true;
		}
	}

	setTile()
	{
		const tileMap = this.viewport.tileMap;

		tileMap.ready.then(event => {

			const tile = tileMap.getTile(this.args.tileId-1);

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

	setAutoAttr(property, attribute)
	{
		const attrMap = this.autoAttr.get(this.box);

		attrMap[attribute] = property;
	}

	invoke(methodName, ...args)
	{
		this.behaviors.forEach(b => {

			if(typeof b[methodName] !== 'function')
			{
				return;
			}

			b[methodName](this, ...args);
		});
	}

	bMap(methodName, ...args)
	{
		const result = new Map;

		for(const b of this.behaviors)
		{
			if(typeof b[methodName] !== 'function')
			{
				continue;
			}

			result.set(b.constructor, b[methodName](this, ...args));
		}

		return result;
	}

	getBoundingLines()
	{
		if(this[BOUNDS])
		{
			return this[BOUNDS];
		}

		let bounds, left, right, top, bottom;

		switch(this.args.mode)
		{
			case MODE_FLOOR:
				left   = this.args.x - (this.isRegion ? 0 : (this.args.width / 2) + -1);
				right  = this.args.x + (this.isRegion ? this.args.width : (this.args.width / 2));
				top    = this.args.y - this.args.height;
				bottom = this.args.y;

				bounds = [
					[right, top, right, bottom]
					, [left, top, left, bottom]
					, [right, top, left, top]
					, [right, bottom, left, bottom]
				]
				break;

			case MODE_CEILING:
				left   = this.args.x - this.args.width / 2;
				right  = this.args.x + this.args.width / 2;
				top    = this.args.y;
				bottom = this.args.y + this.args.height;

				bounds = [
					[right, top, right, bottom]
					, [left, top, left, bottom]
					, [right, top, left, top]
					, [right, bottom, left, bottom]
				]
				break;

			case MODE_LEFT:
				left   = this.args.x;
				right  = this.args.x + this.args.height;
				top    = this.args.y - this.args.width / 2;
				bottom = this.args.y + this.args.width / 2;

				bounds = [
					[right, top, right, bottom]
					, [left, top, left, bottom]
					, [right, top, left, top]
					, [right, bottom, left, bottom]
				]
				break;

			case MODE_RIGHT:
				left   = this.args.x - this.args.height;
				right  = this.args.x;
				top    = this.args.y - this.args.width / 2;
				bottom = this.args.y + this.args.width / 2;

				bounds = [
					[right, top, right, bottom]
					, [left, top, left, bottom]
					, [right, top, left, top]
					, [right, bottom, left, bottom]
				]
				break;
		}

		Object.freeze(bounds);

		return this[BOUNDS] = bounds;
	}

	filterSolids(a)
	{
		return a.args !== this.args
		&& a.callCollideHandler(this)
		&& a.solid;
	}
}
