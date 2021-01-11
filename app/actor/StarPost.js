import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';
import { Monitor } from './Monitor';
import { Projectile } from '../actor/Projectile';

export class StarPost extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-star-post';

		this.args.width  = 16;
		this.args.height = 48;
		this.args.active = false;

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

		if(!this.args.active)
		{
			this.box.setAttribute('data-direction', Math.sign(other.args.gSpeed));
			this.box.setAttribute('data-active', 'true');
			this.box.setAttribute('data-spin', 'true');

			this.sample && this.sample.play();

			const monitor = new Monitor({
				x: this.x - 10
				, y: this.y - 48
				, xSpeed: 5 * (Math.sign(other.args.gSpeed) || 1)
				, ySpeed: -5
			});

			this.viewport.actors.add(monitor);

			this.args.active = true;

			this.spinning = true;

			this.onTimeout(750, () => this.spinning = false);
		}
		else if(other instanceof Projectile && !this.spinning)
		{
			this.box.setAttribute('data-direction', Math.sign(other.args.gSpeed));
			this.box.setAttribute('data-spin', 'false');

			if(this.sample)
			{
				this.sample.currentTime = 0;
				this.sample.play();
			}

			this.onTimeout(0, () => this.box.setAttribute('data-spin', 'true'));

			this.spinning = true;

			this.onTimeout(750, () => this.spinning = false);
		}
	}

	get solid() { return false; }
	get isEffect() { return false; }
}
