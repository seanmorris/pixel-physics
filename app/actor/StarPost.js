import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';
import { Monitor } from './Monitor';


export class StarPost extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-star-post';

		this.args.width  = 16;
		this.args.height = 48;
		this.args.active = false;
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

		this.head   = new Tag('<div class = "star-post-head">')

		this.box.appendChild(this.head.node)
	}

	collideA(other)
	{
		super.collideA(other);

		if(!this.args.active)
		{
			this.box.setAttribute('data-active', 'true');
			this.box.setAttribute('data-direction', Math.sign(other.args.gSpeed));

			this.sample && this.sample.play();

			const monitor = new Monitor({
				x: this.x - 10
				, y: this.y - 48
				, ySpeed: -5
				, xSpeed: other.args.gSpeed
			});

			this.viewport.actors.add(monitor);

			this.args.active = true;
		}
	}

	get solid() { return false; }
	get isEffect() { return false; }
}
