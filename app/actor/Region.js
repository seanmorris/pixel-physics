import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

export class Region extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-water';

		this.args.width  = this.public.width  || 32;
		this.args.height = this.public.height || 32;

		this.args.gravity = 0.25;
		this.args.drag    = 0.85;

		this.draining = 0;
	}

	update()
	{
		if(!this.wrapper && this.tags.sprite)
		{
			this.wrapper = new Tag('<div class = "region-filter-wrapper">');
			this.color   = new Tag('<div class = "region-color">');
			this.filter  = new Tag('<div class = "region-filter">');

			this.wrapper.appendChild(this.filter.node);

			this.tags.sprite.appendChild(this.wrapper.node);
			this.tags.sprite.parentNode.appendChild(this.color.node);
		}

		if(!this.switch)
		{
			this.switch = this.viewport.actorsById[ this.public.switch ]

			this.switch.args.bindTo('active', v => {
				if(!v && this.draining > 0)
				{
					this.draining = -1;
				}

				if(v)
				{
					this.draining = 1;
				}
			});
		}

		super.update();

		if(!this.originalHeight)
		{
			this.originalHeight = this.public.height;
		}

		if(this.draining)
		{
			if(this.public.height <= 0)
			{
				this.args.display = 'none';
			}
			else
			{
				this.args.display = 'initial';
			}

			if(this.draining > 0 && this.public.height > 0)
			{
				this.args.height -= 3;
			}
			else if(this.draining < 0 && this.public.height < this.originalHeight)
			{
				this.args.height += 0.5;
			}
		}
		else
		{
			// const frame  = this.viewport.args.frameId;
			// const offset = Math.sin(frame / 10) * 8;

			// this.args.height = this.originalHeight - offset;

			// this.wrapper && this.wrapper.style({'--offset': offset});
		}

		const topBoundry  = -this.viewport.args.y - (this.y - this.args.height);
		const leftBoundry = -16 + -this.viewport.args.x - this.x;

		this.tags.sprite && this.tags.sprite.style({
			'--viewportWidth':    this.viewport.args.width  + 'px'
			, '--viewportHeight': this.viewport.args.height + 'px'
			, '--leftBoundry':    leftBoundry + 'px'
			, '--topBoundry':     topBoundry + 'px'
		});

	}

	get solid() { return false; }
	get isEffect() { return true; }
}
