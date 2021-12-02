import { Region } from "./Region";

import { Ring } from "../actor/Ring";

import { Tag } from 'curvature/base/Tag';

export class LavaRegion extends Region
{
	isWater = true;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-lava';

		// this.entryParticle = '<div class = "particle-splash">';

		this.args.gravity = 0.5;
		this.args.drag    = 0.85;
		this.args.density = 10;

		this.skimSpeed = 10;
	}

	update()
	{
		if(!this.filterWrapper && this.tags.sprite)
		{
			this.filterWrapper = new Tag('<div class = "region-filter-wrapper">');
			this.colorWrapper  = new Tag('<div class = "region-color-wrapper">');

			this.filter = new Tag('<div class = "region-filter">');
			this.color  = new Tag('<div class = "region-color">');

			this.filterWrapper.appendChild(this.filter.node);
			this.colorWrapper.appendChild(this.color.node);

			this.tags.sprite.appendChild(this.filterWrapper.node);
			this.tags.sprite.appendChild(this.colorWrapper.node);
		}

		if(!this.originalHeight)
		{
			this.originalHeight = this.public.height;
		}

		super.update();
	}

	updateActor(other)
	{
		if(!other.controllable && !(other instanceof Ring))
		{
			return;
		}

		if(other.y < this.y + -this.args.height + 8)
		{
			return;
		}

		if(other.args.ySpeed < 0 || other.args.ignore)
		{
			return;
		}

		other.args.ySpeed = Math.min(-8, -other.args.ySpeed * 1.1);
		other.args.xSpeed *= -1.1;

		other.damage();
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
