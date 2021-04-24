import { Block } from './Block';
import { Tag  } from 'curvature/base/Tag';

export class BreakableBlock extends Block
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-breakable-block';

		this.fragmentsX = new Tag('<div class = "fragmentsX">');
		this.fragmentsY = new Tag('<div class = "fragmentsY">');

		this.fragmentTopLeft = new Tag('<div class = "fragment fragment-top-left">');
		this.fragmentTopRight = new Tag('<div class = "fragment fragment-top-right">');
		this.fragmentBottomLeft = new Tag('<div class = "fragment fragment-bottom-left">');
		this.fragmentBottomRight = new Tag('<div class = "fragment fragment-bottom-right">');

		this.fragmentsY.append(this.fragmentTopLeft.node);
		this.fragmentsY.append(this.fragmentTopRight.node);
		this.fragmentsY.append(this.fragmentBottomLeft.node);
		this.fragmentsY.append(this.fragmentBottomRight.node);

		this.fragmentsX.append(this.fragmentsY.node);

		this.broken = false;
	}

	onRendered()
	{
		this.box    = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.box.append(this.fragmentsX.node);
	}

	collideA(other, type)
	{
		if(this.broken)
		{
			return false;
		}

		if(other.float && this.float && other instanceof Block)
		{
			return false;
		}

		if(!other.controllable)
		{
			return !this.broken;
		}

		if(!other.public.gSpeed && !other.public.xSpeed && !other.public.ySpeed)
		{
			return !this.broken;
		}

		if(other.public.rolling || other.public.jumping || other.public.dashed)
		{
			const top = this.y - this.public.height;

			// if(other.public.jumping && other.y < top)
			// {
			// 	other.args.ySpeed *= -0.75;
			// 	other.args.y = top;
			// }

			this.box.classList.add('broken');

			if(other.public.mode % 2 === 0)
			{
				const x = other.public.xSpeed || other.public.gSpeed;

				this.fragmentsX.style({'--xSpeed': Math.round(x)});
			}


			this.broken = true;

			if(!this.refresher)
			{
				this.refresher = true;
			}
		}

		return !this.broken;
	}

	sleep()
	{
		this.box.classList.remove('broken');

		this.broken = false;
	}

	get solid() { return !this.broken; }

}

