import { Region } from "./Region";

import { Ring } from "../actor/Ring";
import { MarbleBlock } from "../actor/MarbleBlock";

import { Tag } from 'curvature/base/Tag';
import { Bindable } from 'curvature/base/Bindable';

export class ToxicRegion extends Region
{
	isWater = true;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-toxic';

		// this.entryParticle = '<div class = "particle-splash">';

		this.args.gravity = 0.5;
		this.args.drag    = 0.85;
		this.args.density = 15;

		this.skimSpeed = 0;

		this.sapped = new Set;

		this.timings = new WeakMap;

		this.onRemove(() => this.sapped.clear());
	}

	update()
	{
		this.sapped.clear();

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
			this.originalHeight = this.args.height;
		}

		super.update();
	}

	updateActor(other)
	{
		if(other instanceof Ring)
		{
			other.args.ySpeed = -Math.abs(other.args.ySpeed || -6);

			return;
		}

		if(other.noClip)
		{
			return;
		}

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

		if(other.args.mercy || other.immune(this, 'fire'))
		{
			return;
		}
	}

	collideA(other, type)
	{
		if(other.noClip)
		{
			return;
		}

		if(other instanceof MarbleBlock)
		{
			return false;
		}

		if(other.args.standingOn && other.args.standingOn !== Bindable.make(this))
		{
			return false;
		}

		other.args.y = Math.round(other.args.y);

		super.collideA(other, type);

		// if(!other.controllable && !other.pushed)
		// {
		// 	return false;
		// }

		if(other.args.mercy || other.immune(this, 'toxic'))
		{
			return true;
		}

		if(other.args.rings)
		{
			if(!this.sapped.has(other))
			{
				let time = 0;

				if(!this.timings.has(other))
				{
					this.timings.set(other, time);
				}

				time = this.timings.get(other);

				time++;

				this.timings.set(other, time);

				if(time % 27  === 0)
				{
					other.args.rings--;
				}
			}

			this.sapped.add(other);
		}
		else
		{
			other.damage(this, 'toxic');
		}

		return true;
	}

	get solid() { return true; }
	get isEffect() { return true; }
}
