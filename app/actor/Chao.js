import { Png } from '../sprite/Png';
import { PointActor } from './PointActor';
import { Mushroom } from './Mushroom';
import { Coconut } from './Coconut';
import { Tree } from './Tree';
import { Uuid } from 'curvature/base/Uuid';

export class Chao extends PointActor
{
	png = new Png('/DBurraki/chao-normal.png');

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-chao';

		this.args.particleScale = 0.75;
		this.args.spriteSheet   = this.spriteSheet = '/DBurraki/chao-normal.png';

		this.args.width  = 14;
		this.args.height = 18;

		this.args.uuid = args.uuid || String(new Uuid);

		this.xHold = 8;
		this.yHold = 0;

		this.maxFlight = 270;

		this.emotes = ['normal', 'alert', 'inquire', 'like', 'love', 'angry'];
		this.emoteIndex = 0;

		// this.animations = ['standing', 'thinking', 'walking', 'flying', 'sitting', 'searching', 'swimming', 'flying'];
		// this.animationIndex = 0;

		this.args.animation = 'standing';

		this.args.inWater = false;

		this.bindTo('carriedBy', carrier => {
			if(this.cX) { this.cX(); this.cX = null; }
			if(this.cY) { this.cY(); this.cY = null; }
			if(carrier)
			{
				this.cX = carrier.args.bindTo('x', v => this.args.x = v + carrier.args.direction * 8);
				this.cY = carrier.args.bindTo('y', v => this.args.y = v + -16);

				carrier.carrying.add(this);

				this.args.float = -1;
				this.args.groundAngle = 0;
			}
			else if(this.carriedBy)
			{
				const carrier = this.carriedBy;

				this.carriedBy = null;

				this.args.xSpeed = carrier.args.xSpeed;
				this.args.ySpeed = carrier.args.ySpeed;

				this.args.xSpeed += Math.sign(carrier.args.gSpeed || carrier.args.xSpeed) * 4;
				this.args.ySpeed -= 4;

				carrier.carrying.delete(this);

				this.args.falling = true;
				this.args.float = 0;
			}
		});

		this.args.direction = 1;

		this.args.currentState = this.args.currentState || 'sitting';

		this.args.bindTo('currentState', () => {
			this.args.stateTime = 0;
		});

		this.args.alignment = 'neutral';

		this.stats = {
			intelligence: 0
			, stamina:    0
			, luck:       0
			, run:        0
			, swim:       0
			, fly:        0
			, power:      0
		};

		this.traits = {
			appetite:   0
			, sociable: 0
			, restless: 0
		};

		this.mood = {
			attitude: 0
			, happy:  1
			, hunger: 0
			, health: 1
			, social: 0
		}

		this.defaultColors = ['addef8', '2ebee9', '0e6d89', 'ecde2f', 'dcb936', '985000', 'f8b0c0', 'f85080', 'e4e0e4', 'e0e0e0', 'f8f820', '606080'];

		this.customColors = [null,null,null,null,null,null,null,null,null,null,null,null];

		this.customColors.bindTo(() => {

			const colorMap = {};

			for(const i in this.defaultColors)
			{
				colorMap[ this.defaultColors[i] ] = this.customColors[i] ?? this.defaultColors[i];
			}

			this.png.ready.then(()=>{
				const customSheet = this.png.recolor(colorMap).toUrl();
				this.args.spriteSheet = customSheet;
				console.log('!!!');
			});

		}, {wait:0});

		this.chaoAge = 0;
	}

	onAttached(event)
	{
		// super.onRendered(event);

		if(!this.listening)
		{
			this.box.addEventListener('click', event => this.onClick(event));
			this.box.addEventListener('contextmenu', event => this.onRightClick(event));
			this.listening = true;
		}

		this.setAutoAttr('currentState', 'data-current-state');
		this.setAutoAttr('alignment', 'data-alignment');
		this.setAutoAttr('direction', 'data-direction');
		this.setAutoAttr('emote',     'data-emote');

		const viewport = this.viewport;

		this.onRemove(() => clearInterval(viewport.onInterval(1500, () => {
			if(this.emoteIndex >= this.emotes.length)
			{
				this.emoteIndex = 0;
			}

			this.args.emote = this.emotes[this.emoteIndex];

			this.emoteIndex++;

			this.onRemove(() => viewport.onTimeout(500, () => {
				this.args.emote = 'normal';
			}));
		})));

		// this.viewport.onInterval(3000, () => {
		// 	if(this.animationIndex >= this.animations.length)
		// 	{
		// 		this.animationIndex = 0;
		// 	}

		// 	this.args.animation = this.animations[this.animationIndex];

		// 	console.log(this.animations[this.animationIndex]);

		// 	this.animationIndex++;
		// });

		const heroColors = {
			'addef8': 'e4e0e4',
			'2ebee9': 'c0bde4',
			'0e6d89': '9c99c0',

			'ecde2f': 'addef8',
			'dcb936': '2ebee9',
			'985000': '0e6d89',

			'ffa3b1': 'ffa3b1',
			'fa6379': 'fa6379',
			'e4e0e4': 'cdeef8',

			'f8f820': '9c99c0',

			// '606080': '606080',
		};

		const darkColors = {
			'addef8': '485070',
			'2ebee9': '303058',
			'0e6d89': '202020',

			'ecde2f': 'b70000',
			'dcb936': '770000',
			'985000': '420000',

			'ffa3b1': 'ffa3b1',
			'fa6379': 'fa6379',
			'e4e0e4': 'e4e0e4',

			'f8f820': 'bf999c',

			'606080': '202020',
		};

		const rubyColors = {
			'addef8': 'ff7575',
			'2ebee9': 'e00000',
			'0e6d89': '800000',

			'ecde2f': 'b70000',
			'dcb936': '770000',
			'985000': '420000',

			'ffa3b1': 'ffa3b1',
			'fa6379': 'fa6379',
			'e4e0e4': 'e4e0e4',

			'606080': '202020',
		};

		const tangyColors = {
			'addef8': 'e08000',
			'2ebee9': 'b76900',
			'0e6d89': '7d4800',

			'ecde2f': 'b44800',
			'dcb936': '844221',
			'985000': '630000',

			'ffa3b1': 'ffa3b1',
			'fa6379': 'fa6379',
			'e4e0e4': 'e4e0e4',

			'606080': '202020',
		};

		const limeColors = {
			'addef8': '80e000',
			'2ebee9': '69b700',
			'0e6d89': '487d00',

			'ecde2f': '48b400',
			'dcb936': '428421',
			'985000': '006300',

			'ffa3b1': 'ffa3b1',
			'fa6379': 'fa6379',
			'e4e0e4': 'e4e0e4',

			'606080': '202020',
		};

		const coalColors = {
			'addef8': '485070',
			'2ebee9': '303058',
			'0e6d89': '202020',

			'ecde2f': 'c0bde4',
			'dcb936': '9c99c0',
			'985000': '606080',

			'ffa3b1': 'ffa3b1',
			'fa6379': 'fa6379',
			'e4e0e4': 'e4e0e4',

			'f8f820': '9c99c0',

			'606080': '202020',
		};

		const mimeColors = {
			'addef8': 'c0bde4',
			'2ebee9': '9c99c0',
			'0e6d89': '606080',

			'ecde2f': '485070',
			'dcb936': '303058',
			'985000': '202020',

			'ffa3b1': 'ffa3b1',
			'fa6379': 'fa6379',
			'e4e0e4': 'e4e0e4',

			'f8f820': '9c99c0',

			'606080': '202020',
		};

		const whiteColors = {
			'addef8': 'c0bde4',
			'2ebee9': '9c99c0',
			'0e6d89': '606080',

			'ecde2f': 'e4e0e4',
			'dcb936': 'c0bde4',
			'985000': '9c99c0',

			'ffa3b1': 'ffa3b1',
			'fa6379': 'fa6379',
			'e4e0e4': 'e4e0e4',

			'f8f820': '9c99c0',

			'606080': '202020',
		};

		const limeRubyColors = {
			'addef8': '80e000',
			'2ebee9': '69b700',
			'0e6d89': '487d00',

			'ecde2f': 'b70000',
			'dcb936': '770000',
			'985000': '420000',

			'ffa3b1': 'ffa3b1',
			'fa6379': 'fa6379',
			'e4e0e4': 'e4e0e4',

			'606080': '202020',
		};

		this.png.ready.then(()=>{
			this.heroSheet  = this.png.recolor(heroColors).toUrl();
			this.darkSheet  = this.png.recolor(darkColors).toUrl();
			this.rubySheet  = this.png.recolor(rubyColors).toUrl();
			this.tangySheet = this.png.recolor(tangyColors).toUrl();
			this.limeSheet  = this.png.recolor(limeColors).toUrl();
			this.coalSheet  = this.png.recolor(coalColors).toUrl();
			this.mimeSheet  = this.png.recolor(mimeColors).toUrl();
			this.whiteSheet = this.png.recolor(whiteColors).toUrl();
			this.limeRubySheet = this.png.recolor(limeRubyColors).toUrl();
		});
	}

	generate()
	{
		Object.assign(this.stats, {
			intelligence: 0
			, stamina:    0
			, luck:       0
			, run:        0
			, swim:       0
			, fly:        0
			, power:      0
		});

		Object.assign(this.traits, {
			appetite:   0
			, sociable: 0
			, restless: 0
		});

		Object.assign(this.mood, {
			attitude: 0
			, happy:  1
			, hunger: 0
			, health: 1
			, social: 0
		});
	}

	lift(actor)
	{
		if(this.carriedBy === actor)
		{
			this.carriedBy = null;

			this.args.currentState = 'standing';

			return;
		}

		this.carriedBy = actor;

		this.args.currentState = 'held';
	}

	get solid() { return false; }

	update()
	{
		if(viewport.meta.fieldType === 'garden' && this.chaoAge % 120 === 0)
		{
			const zoneState = viewport.getZoneState();
			const stored = zoneState.chao.find(c => c.uuid === this.args.uuid);

			if(!stored)
			{
				zoneState.chao.push(this.store());
			}
			else
			{
				Object.assign(stored, this.store());
			}

			viewport.currentSave.save();
		}

		for(const carried of this.carrying)
		{
			carried.args.x = this.args.x + this.args.direction * this.xHold;
			carried.args.y = this.args.y + this.yHold;
		}

		this.args.inWater = false;

		const floatRegions = [...this.regions].filter(r => r.args.density >= 1);

		if(floatRegions.length)
		{
			if(this.args.currentState !== 'flying' && this.args.ySpeed >= 0)
			{
				const floatTarget = floatRegions[0].args.y - floatRegions[0].args.height + 6;
				const snapSpace = 3;

				if(this.args.currentState !== 'walking')
				{
					this.args.xSpeed = this.args.xSpeed * 0.95;
				}

				if(this.args.y > floatTarget)
				{
					this.args.falling = true;
					this.args.ySpeed += -0.25;
					this.args.float = -1;

					if(this.args.ySpeed > snapSpace)
					{
						this.args.ySpeed = snapSpace;
					}

					if(this.args.ySpeed < -snapSpace)
					{
						this.args.ySpeed = -snapSpace;
					}
				}
				else
				{
					if(this.args.ySpeed > 0 && Math.abs(this.args.y - floatTarget) < snapSpace)
					{
						this.args.y = floatTarget;
					}

					this.args.ySpeed = 0;
					this.args.float = 1;
				}

				this.args.groundAngle = 0;
			}

			this.args.inWater = true;
		}
		else
		{
			if(this.args.currentState !== 'flying')
			{
				this.args.float = 0;
			}
		}

		if(this.mood.hunger < 1)
		{
			if(this.traits.appetite < 0.333)
			{
				this.mood.hunger += 0.00002;
			}
			else if(this.traits.appetite < 0.666)
			{
				this.mood.hunger += 0.00004;
			}
			else
			{
				this.mood.hunger += 0.00006;
			}
		}

		if(this.mood.social < 1)
		{
			if(this.traits.sociable < 0.333)
			{
				this.mood.social += 0.0002;
			}
			else if(this.traits.sociable < 0.666)
			{
				this.mood.social += 0.0004;
			}
			else
			{
				this.mood.social += 0.0006;
			}
		}

		if(!['eating', 'holding'].includes(this.args.currentState))
		{
			if(this.carrying.size)
			{
				this.args.currentState = 'holding';
			}
		}

		const state = String(this.args.currentState).charAt(0).toUpperCase() + String(this.args.currentState).slice(1);

		if(typeof this['state' + state] === 'function')
		{
			this['state' + state]();
		}

		if(this.mood.hunger < 0.3)
		{
			this.selectedFood = null;
			this.selectedTree = null;
		}

		if(this.selectedFood && this.selectedFood.carriedBy)
		{
			this.selectedThing = null;
			this.selectedFood = null;
		}

		if(this.selectedTree && this.selectedTree.args.shaking && this.args.currentState !== 'shakingTree')
		{
			this.selectedThing = null;
			this.selectedTree = null;
		}

		if(!this.selectedTree || !this.selectedTree.args.shaking)
		{
			this.args.z = 2;
		}

		super.update();

		this.args.stateTime++;
		this.chaoAge++;
	}

	collideA(other, type)
	{
		super.collideA(other, type);

		if(this.selectedFriend === other && !this.carriedBy && this.args.currentState !== 'flying')
		{
			this.args.currentState = 'fun';
		}

		if(other.carriedBy || this.carrying.size)
		{
			return;
		}

		if(other instanceof Coconut || other instanceof Mushroom)
		{
			if(other.args.size && other.args.falling === this.args.falling)
			{
				other.lift(this);
			}
		}

		if(this.selectedFood === other)
		{
			this.selectedThing = null;
			this.selectedFood = null;
		}

		if(this.selectedTree === other && Math.abs(this.args.x - other.args.x) < 8 && this.args.y <= other.args.y + 3)
		{
			this.args.currentState = 'shakingTree';
		}
	}

	stateStanding()
	{
		this.args.animation = 'standing';

		if(!this.args.falling)
		{
			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
		}

		if(this.args.stateTime > 120)
		{
			this.args.currentState = 'thinking';
		}
	}

	stateThinking()
	{
		if(!this.args.falling)
		{
			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
		}

		this.args.animation = 'thinking';

		if(this.args.stateTime > 60)
		{
			this.args.currentState = 'searching';
		}
		else if(this.args.stateTime == 0)
		{
			this.args.emote = 'inquire';
		}
	}

	stateSearching()
	{
		this.args.animation = 'searching';
		this.args.emote = 'inquire';

		if(this.args.stateTime > 90)
		{
			this.args.emote = 'alert';
		}
		else
		{
			this.args.emote = 'inquire';
		}

		if(this.args.stateTime > 120)
		{
			this.args.direction = Math.sign(Math.random() - 0.5);

			if(this.getMapSolidAt(this.args.x + this.args.direction * 8, this.args.y))
			{
				this.args.direction *= -1;
			}

			if(this.mood.hunger > 0.5)
			{
				this.args.currentState = 'seekingFood';
			}
			else if(this.mood.social > 0.75)
			{
				this.args.currentState = 'seekingFriend';
			}
			else if(Math.random() > 0.15 * this.traits.restless)
			{
				if(this.args.groundAngle || this.args.inWater)
				{
					this.args.currentState = 'walking';
				}
				else
				{
					this.args.currentState = 'sitting';
				}
			}
			else
			{
				this.args.currentState = 'walking';
			}
		}
	}

	stateWalking()
	{
		if(this.args.inWater)
		{
			this.args.animation = 'flying';
		}
		else
		{
			this.args.animation = 'walking';
		}

		if(this.args.stateTime < 15)
		{
			this.args.emote = 'alert';
		}
		else if(this.args.stateTime === 16)
		{
			this.args.emote = 'normal';
		}

		if(this.args.inWater)
		{
			this.args.xSpeed = 1 * this.args.direction;
		}
		else
		{
			this.args.gSpeed = 0.01 * this.args.direction;
		}

		if(this.args.stateTime > 40)
		{
			if(!this.args.inWater && Math.random() > 0.9)
			{
				this.args.currentState = 'tripping';
			}

			if(!this.selectedThing && Math.random() > 0.95)
			{
				this.args.currentState = 'flying';
			}
			else if(this.selectedThing && this.selectedThing.args.y < this.args.y)
			{
				this.args.currentState = 'flying';
			}
			else if(!this.selectedThing && Math.random() > 0.98)
			{
				this.args.currentState = 'searching';
			}
		}
	}

	stateTripping()
	{
		this.args.animation = 'tripping';

		if(this.args.stateTime > 10)
		{
			this.args.gSpeed = 0;
		}
		else
		{
			this.args.gSpeed = 1 * this.args.direction;
		}

		if(this.args.stateTime > 20)
		{
			if(this.args.stateTime < 30	 && Math.random() > 0.6)
			{
				this.args.emote = 'angry';
			}
		}
		else
		{
			this.args.emote = 'alert';
		}

		if(this.args.stateTime > 120)
		{
			this.args.currentState = 'sitting';
		}
	}

	stateFlying()
	{
		this.args.animation = 'flying';

		if(this.args.inWater)
		{
			this.args.y--;
		}

		if(this.args.stateTime === 1)
		{
			this.flightTime = (this.maxFlight/2) + Math.round((this.maxFlight/2) * Math.random());
		}

		if(this.args.xSpeed && this.getMapSolidAt(this.args.x + Math.sign(this.args.xSpeed)*8, this.args.y))
		{
			this.args.direction *= -1;
			this.args.xSpeed *= -1;
		}

		if(this.getMapSolidAt(this.args.x, this.args.y + 2))
		{
			this.args.falling = true;
			this.args.float = -1;
		}

		if(!this.selectedThing && this.args.stateTime > 120 && this.args.ySpeed < 0)
		{
			this.args.ySpeed *= 0.4;
		}
		else if(this.selectedThing && this.args.y < this.selectedThing.args.y - 96)
		{
			this.args.ySpeed *= 0.4;
		}

		if(this.selectedThing && this.selectedThing.args.y - 32 < this.args.y)
		{
			if(this.selectedThing && Math.abs(this.selectedThing.args.x - this.args.x) > 32)
			{
				this.args.direction = Math.sign(this.selectedThing.args.x - this.args.x);
			}
			this.args.xSpeed  =  1.25 * this.args.direction;

			if(this.args.ySpeed > -1.5)
			{
				this.args.ySpeed -= 0.1;
			}
		}
		else if(this.selectedThing && Math.abs(this.selectedThing.args.x - this.args.x) < 32)
		{
			this.args.direction = Math.sign(this.selectedThing.args.x - this.args.x);
			this.args.currentState = 'walking';
		}

		if(this.args.stateTime < this.flightTime)
		{
			this.args.groundAngle = 0;

			if(!this.args.ySpeed || !this.args.falling)
			{
				if(!this.args.xSpeed && !this.args.gSpeed && !this.selectedThing)
				{
					this.args.direction = Math.sign(Math.random() - 0.5);
				}

				this.args.falling = true;
				this.args.ySpeed  = -1;
				this.args.xSpeed  =  1.25 * this.args.direction;
				this.args.float   =  -1;
			}
			else if(this.args.ySpeed >= 0)
			{
				this.args.currentState = 'flying';
			}
		}
		else if(!this.selectedThing)
		{
			this.args.currentState = 'thinking';
		}
	}

	stateHatching()
	{
		this.stateSitting();
	}

	stateSitting()
	{
		this.args.xSpeed = 0;

		if(this.args.inWater)
		{
			this.args.animation = 'standing';
		}
		else
		{
			this.args.animation = 'sitting';
		}

		if(this.args.stateTime > 120)
		{
			if(this.mood.hunger > 0.5)
			{
				this.args.currentState = 'seekingFood';
			}
			else if(this.mood.social > 0.75)
			{
				this.args.currentState = 'seekingFriend';
			}
			else if(Math.random() > 0.35 * this.traits.restless)
			{
				this.args.currentState = 'walking';
			}
			else
			{
				this.args.currentState = 'thinking';
			}
		}
	}

	stateWaiting()
	{
		this.args.xSpeed = 0;

		if(Math.trunc(this.args.stateTime / 15) % 2)
		{
			if(Math.random() < 0.2)
			{
				this.args.emote = 'inquire';
			}
			else
			{
				this.args.emote = 'normal';
			}
		}

		if(this.args.inWater)
		{
			this.args.animation = 'standing';
		}
		else
		{
			this.args.animation = 'sitting';
		}
	}

	stateSwimming() {}

	stateFlyingLooking() {}

	stateHolding()
	{
		if(this.args.stateTime < 60)
		{
			this.args.animation = 'thinking';
			this.args.emote = 'inquire';
			return;
		}

		for(const carrying of this.carrying)
		{
			carrying.args.gSpeed = 0;
			carrying.args.xSpeed = 0;
			carrying.args.ySpeed = 0;

			if(carrying instanceof Coconut || carrying instanceof Mushroom)
			{
				if(this.mood.hunger > 0.5 || this.mood.hunger > 0.25 && Math.random() < 0.5)
				{
					this.args.emote = 'love';
					this.args.currentState = 'eating';
					carrying.carriedBy = this;
					carrying.noClip = true;
				}
				else
				{
					this.args.currentState = 'walking';
					carrying.noClip = false;
					carrying.carriedBy = null;

					this.carrying.delete(carrying);

					carrying.args.falling = true;
					carrying.args.x = this.args.x;
					carrying.args.y = this.args.y;
					carrying.args.xSpeed  = this.args.direction * -3  + Math.random();
					carrying.args.ySpeed  = -3 + Math.random();
					carrying.args.float   = 0;

					this.ignores.set(carrying, 60);
				}
			}
		}
	}

	stateEating()
	{
		const eating = new Set;

		for(const carrying of this.carrying)
		{
			if(carrying instanceof Coconut || carrying instanceof Mushroom)
			{
				eating.add(carrying);
			}
		}

		if(!this.args.falling)
		{
			this.args.ySpeed = 0;
		}

		if(!this.carriedBy)
		{
			this.args.float = 0;
		}
		else
		{
			this.args.float = -1;
		}

		this.args.xSpeed = 0;
		this.args.animation = 'eating';
		this.args.emote = 'love';

		if(this.selectedThing !== this.selectedFriend)
		{
			this.selectedThing = null;
		}

		this.selectedFood = null;
		this.selectedTree = null;

		if(this.args.stateTime && this.args.stateTime % 75 === 0)
		{
			for(const e of eating)
			{
				e.args.size--;

				this.mood.hunger -= e.args.nourishment;

				if(!e.args.size)
				{
					if(!this.carriedBy)
					{
						this.args.currentState = 'thinking';
					}
					else
					{
						this.args.currentState = 'held';
					}

					e.lift(this);

					this.viewport.actors.remove(e);
				}
			}
		}
	}

	stateHeld()
	{
		this.args.falling = false;

		if(this.args.stateTime < 15)
		{
			this.args.emote = 'like';
		}
		else if(this.args.stateTime < 60)
		{
			this.args.emote = 'love';
			this.args.animation = 'walking';
		}
		else if(this.args.stateTime === 61)
		{
			this.args.emote = 'normal';
			this.args.animation = 'searching';
		}
	}

	stateFun()
	{
		const [closest,minDist] = this.nearestFriend();

		if(!closest)
		{
			this.args.currentState = 'searching';
			return;
		}

		const dir = Math.sign(this.args.x - closest.args.x);
		this.args.direction = -dir;

		if(Math.abs(this.args.x - closest.args.x) < 16)
		{
			this.args.x -= (this.args.x - (closest.args.x + 16 * dir)) * 0.1;
		}

		if(minDist > 25)
		{
			this.args.currentState = 'searching';
			return;
		}

		if(this.mood.social < 0.5)
		{
			this.args.direction *= -1;
			this.args.currentState = 'walking';
			this.selectedFriend = null;
			this.selectedThing = null;
			return;
		}

		if(this.args.stateTime < 45)
		{
			this.args.emote = 'alert';
		}
		else
		{
			this.args.emote = 'love';
		}

		this.args.animation = 'walking';

		let factor = 1;

		if(this.selectedThing && this.selectedThing.args.currentState === 'fun')
		{
			factor = 0.4;
		}

		if(this.traits.sociable < 0.333)
		{
			this.mood.social -= 0.004 * factor;
		}
		else if(this.traits.sociable < 0.666)
		{
			this.mood.social -= 0.003 * factor;
		}
		else
		{
			this.mood.social -= 0.002 * factor;
		}
	}

	stateSeekingFriend()
	{
		if(this.viewport.args.frameId % 60 === 0)
		{
			const [closest,minDist] = this.nearestFriend();
			this.selectedThing = closest;
			this.selectedFriend = closest;

			if(!closest)
			{
				this.args.currentState = 'thinking';
				return;
			}

			this.args.direction = Math.sign(closest.args.x - this.args.x);

			if(closest.args.y < this.args.y)
			{
				this.args.currentState = 'flying';
			}
			else
			{
				this.args.currentState = 'walking';
			}
		}
	}

	stateSeekingFood()
	{
		this.selectedFriend = null;

		if(this.viewport.args.frameId % 60 === 0)
		{
			const [closest,minDist] = this.nearestFood();
			this.selectedThing = closest;
			this.selectedFood = closest;

			if(closest)
			{
				this.args.direction = Math.sign(closest.args.x - this.args.x);

				if(closest.args.y < this.args.y)
				{
					this.args.currentState = 'flying';
				}
				else
				{
					this.args.currentState = 'walking';
				}
			}
			else
			{
				this.selectedThing = null;
				this.selectedFood = null;

				this.args.currentState = 'thinking';

				const [closest,minDist] = this.nearestTree();
				this.selectedThing = closest;
				this.selectedTree = closest;

				if(!closest)
				{
					this.selectedThing = null;
					this.selectedTree = null;
					this.args.currentState = 'thinking';
					return;
				}

				this.args.direction = Math.sign(closest.args.x - this.args.x);

				if(closest.args.y < this.args.y)
				{
					this.args.currentState = 'flying';
				}
				else
				{
					this.args.currentState = 'walking';
				}
			}
		}
	}

	stateShakingTree()
	{
		if(!this.selectedTree)
		{
			this.args.currentState = 'thinking';
			return;
		}

		if(!this.selectedTree.args.coconutCount)
		{
			this.args.currentState = 'thinking';
			return;
		}

		if(this.args.stateTime % 45 === 0 && Math.random() > 0.75)
		{
			this.args.selectedThing = null;
			this.args.selectedTree  = null;
			this.args.currentState  = 'seekingFood';
			this.args.animation     = 'standing';
			return;
		}

		const dir = Math.sign(this.args.x - this.selectedTree.args.x);
		this.args.direction = -dir;
		this.args.x = this.selectedTree.args.x + 8 * dir;
		this.args.z = this.selectedTree.args.z - 1;
		this.args.gSpeed = 0;

		this.args.animation = 'shaking';
	}

	store()
	{
		const frozen = {
			stateTime:  this.args.stateTime
			, state:    this.args.currentState
			, name:     this.args.name
			, colors:   this.customColors
			, align:    this.args.alignment
			, position: [this.args.x, this.args.y]
			, traits:   this.traits
			, uuid:     this.args.uuid
			, stats:    this.stats
			, mood:     this.mood
			, age:      this.chaoAge
		};

		return frozen;
	}

	load(frozen)
	{
		if(typeof frozen === 'string')
		{
			frozen = JSON.parse(frozen);
		}

		this.args.name = frozen.name ?? '';

		if(frozen.align)
		{
			this.args.alignment = frozen.align;
		}

		if(frozen.position)
		{
			this.args.x = frozen.position[0];
			this.args.y = frozen.position[1];
		}

		if(frozen.state)
		{
			this.args.currentState = frozen.state;
			this.args.stateTime = frozen.stateTime ?? 0;
		}

		if(frozen.uuid)
		{
			this.args.uuid = frozen.uuid;
		}

		if(frozen.age)
		{
			this.chaoAge = frozen.age;
		}

		frozen.colors && Object.assign(this.customColors, frozen.colors);
		frozen.traits && Object.assign(this.stats, frozen.traits);
		frozen.stats  && Object.assign(this.stats, frozen.stats);
		frozen.mood   && Object.assign(this.mood,  frozen.mood);
	}

	nearestFriend()
	{
		const actors = this.viewport.nearbyActors(this.args.x, this.args.y);
		let closest = null;
		let minDist = Infinity;

		for(const actor of actors)
		{
			if(actor === this)
			{
				continue;
			}

			// if(!(actor instanceof this.constructor) && !actor.controllable)
			if(!(actor instanceof this.constructor))
			{
				continue;
			}

			if(actor.args.gSpeed || actor.args.currentState === 'eating')
			{
				continue;
			}

			const dist = this.distanceTo(actor);

			if(this.canSee(actor) && dist < minDist)
			{
				closest = actor;
				minDist = dist;
			}
		}

		return [closest,minDist];
	}

	nearestFood()
	{
		const actors = this.viewport.nearbyActors(this.args.x, this.args.y);
		let closest = null;
		let minDist = Infinity;

		for(const actor of actors)
		{
			if(actor === this)
			{
				continue;
			}

			if(!(actor instanceof Coconut))
			{
				continue;
			}

			if(actor.carriedBy)
			{
				continue;
			}

			const dist = this.distanceTo(actor);

			if(this.canSee(actor) && dist < minDist)
			{
				closest = actor;
				minDist = dist;
			}
		}

		return [closest,minDist];
	}

	nearestTree()
	{
		const actors = this.viewport.nearbyActors(this.args.x, this.args.y);
		let closest = null;
		let minDist = Infinity;

		for(const actor of actors)
		{
			if(actor === this)
			{
				continue;
			}

			if(!(actor instanceof Tree))
			{
				continue;
			}

			if(!actor.args.coconutCount)
			{
				continue;
			}

			if(actor.args.shaking)
			{
				continue;
			}

			const dist = this.distanceTo(actor);

			if(this.canSee(actor) && dist < minDist)
			{
				closest = actor;
				minDist = dist;
			}
		}

		return [closest,minDist];
	}
}
