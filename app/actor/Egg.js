import { Png } from '../sprite/Png';
import { PointActor } from './PointActor';
import { Bindable } from 'curvature/base/Bindable';
import { EggShellTop } from './EggShellTop';
import { Chao } from './Chao';

export class Egg extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-egg';

		this.args.shell = 'normal';

		this.args.bindTo('shell',v => {
			switch(v)
			{
				case 'flat':
				case 'normal':
					this.args.spriteSheet = `/DBurraki/chao-egg-${v}.png`;
					break;
				default:
					this.args.spriteSheet = `/DBurraki/chao-egg-normal.png`;
					break;
			}

			this.png = new Png(this.args.spriteSheet);
		});

		this.args.width  = 15;
		this.args.height = 20;

		this.broken = false;

		// this.defaultChaoColors = ['addef8', '2ebee9', '0e6d89', 'ecde2f', 'dcb936', '985000', 'f8b0c0', 'f85080', 'e4e0e4', 'e0e0e0', 'f8f820', '606080', 'e2e0e2'];

		this.customChaoColors = [null,null,null,null,null,null,null,null,null,null,null,null,null];

		const colorMap = [12, 0, 1, 2];

		this.defaultColors = ['e2e0e2', 'addef8', '2ebee9', '0e6d89'];
		this.customColors  = [null, null, null, null];

		this.customColors.bindTo(() => {

			const colorMap = {};

			for(const i in this.defaultColors)
			{
				colorMap[ this.defaultColors[i] ] = this.customColors[i] ?? this.defaultColors[i];
			}

			this.png.ready.then(()=>{
				const customSheet = this.png.recolor(colorMap).toUrl();
				this.args.spriteSheet = customSheet;
			});

		}, {wait:0});

		this.customChaoColors.bindTo((v,k) => {
			k = Number(k);

			if(!colorMap.includes(k))
			{
				return;
			}


			const shellColorKey = colorMap.indexOf(k);

			this.customColors[shellColorKey] = v;

			if(v !== null)
			{
				this.args.shell = 'flat';
			}
		});

		const colorSelection = [
			[null,null,null,null,null,null,null,null,null,null,null,null,null]
			// blue + yellow (normal)
			, [null,null,null,"80e000","69b700","487d00",null,null,null,null,null,null,null]
			  // blue + green
			, ["485070","303058","202020",null,null,null,null,null,null,null,null,"202020","5f6994"]
			  // black + yellow
			, ["e4e0e4","c0bde4","9c99c0",null,null,null,null,null,null,null,null,null,"e4e0e4"]
			  // white + yellow
			, ["e4e0e4","c0bde4","9c99c0","addef8","2ebee9","0e6d89",null,null,null,null,null,null,"e4e0e4"]
			  // white + blue
			, ["485070","303058","202020","b70000","770000","420000",null,null,null,null,"bf999c","202020","5f6994"]
			  // black + red
			, ["ff7575","e00000","800000","b70000","770000","420000",null,null,null,null,null,"202020","ffaeae"]
			  // ruby
			, ["ffc20e","dd8604","ad4d05","b44800","844221","630000",null,null,null,null,null,"202020","fae3af"]
			  // tangy
			, ["80e000","69b700","487d00","48b400","428421","006300",null,null,null,null,null,"202020","cef00f"]
			  // lime
			, ["485070","303058","202020","c0bde4","9c99c0","606080",null,null,null,null,"9c99c0","202020","5f6994"]
			  // black + white
			, ["c0bde4","9c99c0","606080","485070","303058","202020",null,null,null,null,"9c99c0","202020","e4e0e4"]
			  // white + black
			, ["c0bde4","9c99c0","606080","e4e0e4","c0bde4","9c99c0",null,null,null,null,"9c99c0","202020","e4e0e4"]
			  // white + white
		];

		Object.assign(this.customChaoColors, colorSelection[Math.trunc(Math.random() * (-1+colorSelection.length))]);

		this.args.bindTo('falling', falling => {
			const impact = this.ySpeedLast;
			if(falling || this.broken || impact < 12) { return };
			this.hatch();
		});

		this.bindTo('carriedBy', carrier => {
			if(this.cX) { this.cX(); this.cX = null; }
			if(this.cY) { this.cY(); this.cY = null; }
			if(carrier)
			{
				this.cX = carrier.args.bindTo('x', v => this.args.x = v + carrier.args.direction * 12);
				this.cY = carrier.args.bindTo('y', v => this.args.y = v + -12);

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

				this.args.xSpeed += carrier.xAxis * 2;

				carrier.carrying.delete(this);

				this.args.falling = true;
				this.args.float = 0;

				this.args.groundAngle = 0;

			}
		});
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.setAutoAttr('shell', 'data-shell');
	}

	lift(actor)
	{
		if(this.carriedBy === actor)
		{
			this.carriedBy = null;

			return;
		}

		this.carriedBy = actor;
	}

	sleep()
	{
		if(!this.broken)
		{
			return;
		}

		this.viewport.actors.remove(this);
	}

	hatch()
	{
		const impact = this.ySpeedLast;

		this.args.type = 'actor-item actor-egg actor-egg-shell-bottom';

		const shellTop = new EggShellTop({
			spriteSheet: this.args.spriteSheet
			, xSpeed: this.xSpeedLast * 0.6
			, ySpeed: -impact * 0.4
			, x: this.x
			, y: this.y - 10
		});

		const chao = new Chao({
			currentState: 'hatching'
			, xSpeed: this.xSpeedLast * 0.4
			, ySpeed: -impact * 0.4
			, x: this.x
			, y: this.y - 10
		});

		this.args.gSpeed = this.xSpeedLast * 0.2

		this.viewport.spawn.add({object:shellTop});
		this.viewport.spawn.add({object:chao});

		Object.assign(chao.customColors, this.customChaoColors);

		Object.assign(chao.traits, {
			appetite:   Math.random()
			, sociable: Math.random()
			, restless: Math.random()
		});

		chao.mood.hunger = 0.8;

		this.broken = true;
	}

	get rotateLock() { return true; }
	get solid() { return false; }
}
