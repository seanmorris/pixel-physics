import { Block } from './Block';
import { Orb } from './Orb';

import { Tag  } from 'curvature/base/Tag';

export class BreakableBlock extends Block
{
	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-breakable-block';
		this.args.static = true;

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

		super.onRendered();
	}

	collideA(other, type)
	{
		if(this.broken)
		{
			return false;
		}

		if(!(other.args.rolling && other.args.mode))
		{
			if(other.args.falling || (!other.args.falling && type === 0))
			{
				return true;
			}
		}

		if(other instanceof Block && (other.public.float || this.public.float))
		{
			return false;
		}

		if(!(other instanceof Orb) && !other.isVehicle && !other.controllable && !other.args.rolling)
		{
			return !this.broken;
		}

		if(!(other instanceof Orb) && !other.falling && !other.isVehicle && !other.public.gSpeed && !other.public.xSpeed && !other.public.ySpeed)
		{
			return !this.broken;
		}

		if((other instanceof Orb) || other.isVehicle || other.public.rolling || other.public.jumping || other.public.dashed)
		{
			const top = this.y - this.public.height;

			if(this.public.bounceBack && other.public.jumping && other.y < top)
			{
				other.args.ySpeed *= -bounceBack;
				other.args.y = top;
			}

			this.onNextFrame(()=>this.break(other));

			return false;
		}

		return !this.broken;
	}

	sleep()
	{
		this.box.classList.remove('broken');
		this.args.x = this.def.get('x');
		this.args.y = this.def.get('y');

		this.broken = false;
	}

	break(other)
	{
		this.box.classList.add('broken');

		this.box.classList.add('breaking');

		this.viewport.onFrameOut(4, () => {
			this.box.classList.remove('breaking');
		});

		if(other && other.public.mode % 2 === 0)
		{
			const x = other.public.xSpeed || other.public.gSpeed;

			if(other.isVehicle)
			{
				this.fragmentsX.style({'--xSpeed': Math.round(x * 1.1 )});
			}
			else
			{
				this.fragmentsX.style({'--xSpeed': Math.round(x)});
			}
		}

		if(!this.refresher)
		{
			this.refresher = true;
		}

		this.broken = true;
	}

	get solid() { return !this.broken; }

}

