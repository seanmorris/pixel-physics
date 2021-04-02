import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class RollingRegion extends Region
{
	isWater = true;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region rolling';

		// this.entryParticle = '<div class = "particle-splash">';

		// this.args.gravity = 0.5;
		// this.args.drag    = 0.85;
		// this.args.density = 10;

		// this.skimSpeed = 10;
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
		if(Math.abs(other.public.gSpeed) < 4)
		{
			other.args.gSpeed = 4 * Math.sign(other.args.gSpeed || other.args.direction);
		}

		if(!other.public.rolling)
		{
			other.args.rolling = true;
		}

		if(other.willJump)
		{
			other.willJump = false;
		}
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
