import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';
import { Projectile } from '../actor/Projectile';

import { Monitor } from './Monitor';

import { RingMonitor } from './monitor/RingMonitor';

import { SheildFireMonitor } from './monitor/SheildFireMonitor';
import { SheildWaterMonitor } from './monitor/SheildWaterMonitor';
import { SheildElectricMonitor } from './monitor/SheildElectricMonitor';

export class StarPost extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-star-post';

		this.args.width  = 16;
		this.args.height = 48;
		this.args.active = false;
		this.args.static = true;

		this.spinning = false;
	}

	update()
	{
		super.update();

		if(this.viewport && this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/starpost-active.wav');
			this.sample.volume = 0.5 + (Math.random() * 0.025);
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

		if(!other.controllable && !other.args.owner && !other.occupant)
		{
			return;
		}

		if(!this.box)
		{
			return;
		}

		if(!this.args.active)
		{
			this.box.setAttribute('data-direction', other.args.direction);
			this.box.setAttribute('data-active', 'true');
			this.box.setAttribute('data-spin', 'true');

			this.viewport.args.audio && this.sample && this.sample.play();

			let throwSpeed = (other.args.gSpeed || other.args.xSpeed) / 2;

			if(Math.abs(throwSpeed) > 5)
			{
				throwSpeed = 5 * Math.sign(throwSpeed);
			}

			const monitorClasses = [
				RingMonitor
				, SheildFireMonitor
				, SheildWaterMonitor
				, SheildElectricMonitor
			];

			const monitorClass = monitorClasses[Math.floor( Math.random() * monitorClasses.length )];

			const monitor = new monitorClass({
				direction: other.args.direction
				, xSpeed:  throwSpeed
				, ySpeed:  -5
				, x:       this.x - 10
				, y:       this.y - 48
			});

			this.viewport.spawn.add({object:monitor});

			this.args.active = true;

			this.onTimeout(3000, () => {
				this.box.setAttribute('data-active', 'false');
				this.args.active = false
			});

			this.spinning = true;

			this.onTimeout(600, () => this.spinning = false);
		}
		else if(other instanceof Projectile && !this.spinning)
		{
			this.box.setAttribute('data-direction', other.args.direction);
			this.box.setAttribute('data-spin', 'false');

			if(this.viewport.args.audio && this.sample)
			{
				this.sample.currentTime = 0;
				this.sample.play();
			}

			this.onTimeout(0, () => this.box.setAttribute('data-spin', 'true'));

			this.spinning = true;

			this.onTimeout(600, () => this.spinning = false);
		}
	}

	get solid() { return false; }
}
