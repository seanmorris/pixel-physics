import { Png } from '../sprite/Png';
import { PointActor } from './PointActor';

export class Chao extends PointActor
{
	png = new Png('/DBurraki/chao-normal.png');

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-chao';

		this.args.spriteSheet = this.spriteSheet = '/DBurraki/chao-normal.png';

		this.args.width  = 14;
		this.args.height = 18;

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
	}

	onRendered(event)
	{
		console.log(event);

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

		console.log(event);

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

			console.log(this.heroSheet);
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
		switch(this.args.currentState)
		{
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

				if(this.args.stateTime > 120)
				{
					this.args.currentState = 'thinking';
				}

				break;

			case 'thinking':

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

					if(Math.random() > 0.25)
					{
						this.args.currentState = 'sitting';
					}
					else
					{
						this.args.currentState = 'walking';
					}
				}

				break;

			case 'walking':

				this.args.animation = 'walking';

				if(this.args.stateTime < 15)
				{
					this.args.emote = 'alert';
				}
				else if(this.args.stateTime === 16)
				{
					this.args.emote = 'normal';
				}

				this.args.gSpeed = 0.01 * this.args.direction;

				if(this.args.stateTime > 40)
				{
					this.args.currentState = 'flying';
				}

				break;

			case 'flying':

				this.args.animation = 'flying';

				if(this.args.stateTime < 45)
				{
					if(!this.args.falling)
					{
						this.args.falling = true;
						this.args.direction = Math.sign(Math.random() - 0.5);
						this.args.ySpeed  = -Math.sin(this.args.stateTime / 0.05);
						this.args.xSpeed  =  1.25 * this.args.direction;
						this.args.float   = 45;
					}
					else if(this.args.ySpeed >= 0)
					{
						this.args.currentState = 'flying';
					}

				}
				else
				{
					this.args.currentState = 'thinking';
				}

				break;

			case 'sitting':
				this.args.animation = 'sitting';

				if(this.args.stateTime > 120)
				{
					this.args.currentState = 'thinking';
				}

				break;

			case 'swimming': break;

			case 'flying-looking': break;
		}

		super.update();

		this.args.stateTime++;
	}

	stateStanding() {}

	stateThinking() {}

	stateWalking() {}

	stateFlying() {}

	stateSitting() {}

	stateSwimming() {}

	stateFlyingLooking() {}
}
