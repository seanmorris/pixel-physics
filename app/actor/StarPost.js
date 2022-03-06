import { CharacterString } from '../ui/CharacterString';
import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';
// import { Projectile } from '../actor/Projectile';
import { Sfx } from '../audio/Sfx';

import { Monitor } from './Monitor';

import { RingMonitor } from './monitor/RingMonitor';

import { SheildElectricMonitor } from './monitor/SheildElectricMonitor';
import { SheildWaterMonitor } from './monitor/SheildWaterMonitor';
import { SheildFireMonitor } from './monitor/SheildFireMonitor';

export class StarPost extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-star-post';

		this.args.width  = 16;
		this.args.height = 48;
		this.args.active = this.args.active ?? false;
		this.args.static = true;

		this.spinning = false;
	}

	update()
	{
		super.update();

		if(this.args.wasActive)
		{
			const monitor = new RingMonitor({
				direction: 0
				, ySpeed:  -4
				, x:       this.x - 10
				, y:       this.y - 48
			});

			this.viewport.onFrameOut(12, () => {
				this.viewport.spawn.add({object:monitor});
			});


			this.args.wasActive = false;
		}
	}

	onRendered()
	{
		super.onRendered();

		this.sprite = this.findTag('div.sprite');
		this.box    = this.findTag('div');

		this.headBox = new Tag('<div class = "star-post-head-box">')
		this.head   = new Tag('<div class = "star-post-head">')

		this.headBox.appendChild(this.head.node);

		this.box.appendChild(this.headBox.node)
	}

	collideA(other)
	{
		super.collideA(other);

		if(other.args.owner)
		{
			other = other.args.owner;
		}

		if(!other.controllable && !other.occupant)
		{
			return;
		}

		if(!this.box)
		{
			return;
		}

		if(!this.args.active)
		{
			this.args.active = true;

			this.box.setAttribute('data-direction', other.args.direction);
			this.box.setAttribute('data-active', 'true');
			this.box.setAttribute('data-spin', 'true');

			Sfx.play('STARPOST_HIT');

			let throwSpeed = (other.args.gSpeed || other.args.xSpeed);

			if(Math.abs(throwSpeed) > 8)
			{
				throwSpeed = 8 * Math.sign(throwSpeed);
			}

			const monitorClasses = other.args.rings > 50
				? [RingMonitor, SheildFireMonitor, SheildWaterMonitor, SheildElectricMonitor]
				: [RingMonitor];

			const monitorClass = monitorClasses[Math.floor( Math.random() * monitorClasses.length )];

			const monitor = new monitorClass({
				direction: other.args.direction
				, xSpeed:  throwSpeed
				, ySpeed:  -5
				, x:       this.x - 10
				, y:       this.y - 48
			});

			this.viewport.storeCheckpoint(other.args.canonical, this.args.id);

			this.viewport.spawn.add({object:monitor});

			// this.viewport.onFrameOut(360, () => {
			// 	this.box.setAttribute('data-active', 'false');
			// 	this.box.setAttribute('data-spin', 'false');
			// 	this.args.active = false;
			// });

			this.spinning = true;

			this.viewport.onFrameOut(36, () => {
				this.spinning = false;
			});

			if(typeof ga === 'function')
			{
				ga('send', 'event', {
					eventCategory: 'starpost',
					eventAction: 'activated',
					eventLabel: `${this.viewport.args.actName}::${this.args.id}`
				});
			}

			// const time  = (this.viewport.args.frameId - this.viewport.args.startFrameId) / 60;
			// let minutes = String(Math.floor(Math.abs(time) / 60)).padStart(2,'0')
			// let seconds = String((Math.abs(time) % 60).toFixed(0)).padStart(2,'0');

			// const neg = time < 0 ? '-' : '';

			// if(neg)
			// {
			// 	minutes = Number(minutes);
			// }

			// const yardsPerFrame = other.args.gSpeed / 32;
			// const feetPerSecond = yardsPerFrame * 60 * 3;

			// this.args.charStrings = [
			// 	new CharacterString({value: `Speed: ${feetPerSecond.toFixed(3)} ft/s`})
			// 	, new CharacterString({value: `Time: ${neg}${minutes}:${seconds}`})
			// 	, new CharacterString({value: `Score: ${other.args.score}`})
			// 	, new CharacterString({value: `Rings: ${other.args.rings}`})
			// ];
		}
		// else if(other instanceof Projectile && !this.spinning)
		// {
		// 	this.box.setAttribute('data-direction', other.args.direction);
		// 	this.box.setAttribute('data-spin', 'false');

		// 	if(this.viewport.args.audio && this.sample)
		// 	{
		// 		this.sample.currentTime = 0;
		// 		this.sample.play();
		// 	}

		// 	this.onTimeout(0, () => this.box.setAttribute('data-spin', 'true'));

		// 	this.spinning = true;

		// 	this.onTimeout(600, () => this.spinning = false);
		// }
	}

	get solid() { return false; }
}
