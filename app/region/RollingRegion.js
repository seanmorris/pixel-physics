import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class RollingRegion extends Region
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'region rolling';

		this.args.minSpeed = args.minSpeed || 4;
	}

	update()
	{
		// if(!this.filterWrapper && this.tags.sprite)
		// {
		// 	this.filterWrapper = new Tag('<div class = "region-filter-wrapper">');
		// 	this.colorWrapper  = new Tag('<div class = "region-color-wrapper">');

		// 	this.filter = new Tag('<div class = "region-filter">');
		// 	this.color  = new Tag('<div class = "region-color">');

		// 	this.filterWrapper.appendChild(this.filter.node);
		// 	this.colorWrapper.appendChild(this.color.node);

		// 	this.tags.sprite.appendChild(this.filterWrapper.node);
		// 	this.tags.sprite.appendChild(this.colorWrapper.node);
		// }

		if(!this.originalHeight)
		{
			this.originalHeight = this.public.height;
		}

		super.update();
	}

	updateActor(other)
	{
		if(!other.controllable)
		{
			return;
		}

		if(Math.abs(other.args.gSpeed) < this.args.minSpeed)
		{
			other.args.gSpeed = this.args.minSpeed * Math.sign(other.args.gSpeed || other.args.direction);
		}

		if(!other.public.rolling)
		{
			other.args.rolling = true;
		}

		if(other.willJump)
		{
			other.willJump = false;
		}

		other.args.ignore = 4;

	}

	collideA(other, type)
	{
		super.collideA(other, type);
	}

	collideB(other, type)
	{
		super.collideA(other, type);
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
