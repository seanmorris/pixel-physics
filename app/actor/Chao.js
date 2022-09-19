import { Png } from '../sprite/Png';
import { PointActor } from './PointActor';
import { Coconut } from './Coconut';

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

		this.xHold = 8;
		this.yHold = 0;

		this.maxFlight = 180;

		this.emotes = ['normal', 'alert', 'inquire', 'like', 'love', 'angry'];
		this.emoteIndex = 0;

		// this.animations = ['standing', 'thinking', 'walking', 'flying', 'sitting', 'searching', 'swimming', 'flying'];
		// this.animationIndex = 0;

		this.args.animation = 'standing';

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

		this.args.currentState = 'sitting';

		this.args.bindTo('currentState', () => {
			this.args.stateTime = 0;
		});

		this.stats = {run: 0, swim: 0, fly: 0, power:0, stamina: 0, luck: 0, intelligence: 0};

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

	}

	onRendered(event)
	{
		super.onRendered(event);

		if(!this.listening)
		{
			this.box.addEventListener('click', event => this.onClick(event));
			this.box.addEventListener('contextmenu', event => this.onRightClick(event));
			this.listening = true;
		}

		this.setAutoAttr('emote',     'data-emote');
		this.setAutoAttr('alignment', 'data-alignment');
		this.setAutoAttr('direction', 'data-direction');

		this.viewport.onInterval(1500, () => {
			if(this.emoteIndex >= this.emotes.length)
			{
				this.emoteIndex = 0;
			}

			this.args.emote = this.emotes[this.emoteIndex];

			this.emoteIndex++;

			this.viewport.onTimeout(500, () => {
				this.args.emote = 'normal';
			});
		});

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

	onClick(event)
	{
		if(this.args.spriteSheet === this.heroSheet)
		{
			this.args.spriteSheet = this.darkSheet;
			this.args.alignment = 'dark';
		}
		else if(this.args.spriteSheet === this.darkSheet)
		{
			this.args.spriteSheet = this.rubySheet;
			this.args.alignment = 'normal';
		}
		else if(this.args.spriteSheet === this.rubySheet)
		{
			this.args.spriteSheet = this.tangySheet;
			this.args.alignment = 'normal';
		}
		else if(this.args.spriteSheet === this.tangySheet)
		{
			this.args.spriteSheet = this.limeSheet;
			this.args.alignment = 'normal';
		}
		else if(this.args.spriteSheet === this.limeSheet)
		{
			this.args.spriteSheet = this.coalSheet;
			this.args.alignment = 'normal';
		}
		else if(this.args.spriteSheet === this.coalSheet)
		{
			this.args.spriteSheet = this.whiteSheet;
			this.args.alignment = 'normal';
		}
		else if(this.args.spriteSheet === this.whiteSheet)
		{
			this.args.spriteSheet = this.mimeSheet;
			this.args.alignment = 'normal';
		}
		else if(this.args.spriteSheet === this.mimeSheet)
		{
			this.args.spriteSheet = this.limeRubySheet;
			this.args.alignment = 'normal';
		}
		else if(this.args.spriteSheet === this.limeRubySheet)
		{
			this.args.spriteSheet = this.spriteSheet;
			this.args.alignment = 'normal';
		}
		else
		{
			this.args.spriteSheet = this.heroSheet;
			this.args.alignment = 'hero';
		}
	}

	onRightClick(event)
	{
		event.preventDefault();
		event.stopPropagation();

		if(this.args.alignment === 'dark')
		{
			this.args.alignment = 'normal';
		}
		else if(this.args.alignment === 'normal')
		{
			this.args.alignment = 'hero';
		}
		else
		{
			this.args.alignment = 'dark';
		}
	}

	get solid() { return false; }

	update()
	{
		let inWater = false;

		const floatRegions = [...this.regions].filter(r => r.args.density >= 1);

		if(floatRegions.length)
		{
			if(this.args.currentState !== 'flying' || this.args.ySpeed > 0)
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

			inWater = true;
		}
		else
		{
			if(this.args.currentState !== 'flying')
			{
				this.args.float = 0;
			}
		}

		const eating = new Set;

		for(const carrying of this.carrying)
		{
			if(carrying instanceof Coconut)
			{
				this.args.currentState = 'eating';

				eating.add(carrying);
			}
		}

		switch(this.args.currentState)
		{
			case 'eating':
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

				if(this.args.stateTime && this.args.stateTime % 75 === 0)
				{
					for(const e of eating)
					{
						e.args.size--;

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

				break;

			case 'held':

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

				break;

			case 'standing':
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

				break;

			case 'thinking':

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

				break;

			case 'searching':
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

					if(Math.random() > 0.15)
					{
						if(this.args.groundAngle || inWater)
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

				break;

			case 'walking':

				if(inWater)
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

				if(inWater)
				{
					this.args.xSpeed = 1 * this.args.direction;
				}
				else
				{
					this.args.gSpeed = 0.01 * this.args.direction;
				}


				if(this.args.stateTime > 40)
				{
					if(Math.random() > 0.95)
					{
						this.args.currentState = 'flying';
					}

					if(Math.random() > 0.98)
					{
						this.args.currentState = 'searching';
					}
				}

				break;

			case 'flying':

				this.args.animation = 'flying';

				if(this.args.stateTime === 1)
				{
					this.flightTime = (this.maxFlight/2) + Math.round((this.maxFlight/2) * Math.random());
				}

				if(this.args.stateTime > 60 && this.args.ySpeed < 0)
				{
					this.args.ySpeed *= 0.1;
				}

				if(this.args.stateTime < this.flightTime)
				{
					this.args.groundAngle = 0;

					if(!this.args.ySpeed || !this.args.falling)
					{
						if(!this.args.xSpeed && !this.args.gSpeed)
						{
							this.args.direction = Math.sign(Math.random() - 0.5);
						}

						this.args.falling = true;
						this.args.ySpeed  = -Math.sin(this.args.stateTime / 0.05);
						this.args.xSpeed  =  1.25 * this.args.direction;
						this.args.float   =  -1;
					}
					else if(this.args.ySpeed >= 0)
					{
						this.args.currentState = 'flying';
					}

					if(this.getMapSolidAt(this.args.x + this.args.direction * 8, this.args.y))
					{
						this.args.direction *= -1;
						this.args.xSpeed *= -1;
					}
				}
				else
				{
					this.args.currentState = 'thinking';
				}

				break;

			case 'sitting':

				this.args.xSpeed = 0;

				if(inWater)
				{
					this.args.animation = 'standing';
				}
				else
				{
					this.args.animation = 'sitting';
				}

				if(this.args.stateTime > 120)
				{
					if(Math.random() > 0.35)
					{
						this.args.currentState = 'walking';
					}
					else
					{
						this.args.currentState = 'thinking';
					}
				}

				break;

			case 'swimming': break;

			case 'flying-looking': break;
		}

		super.update();

		this.args.stateTime++;
	}

	collideA(other, type)
	{
		super.collideA(other, type);

		if(other.carriedBy || this.carrying.size)
		{
			return;
		}

		if(other instanceof Coconut)
		{
			if(other.args.size)
			{
				other.lift(this);
			}
		}
	}

	stateStanding() {}

	stateThinking() {}

	stateWalking() {}

	stateFlying() {}

	stateSitting() {}

	stateSwimming() {}

	stateFlyingLooking() {}
}
