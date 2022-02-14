import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

export class WaterRegion extends Region
{
	isWater = true;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-water';

		this.entryParticle = '<div class = "particle-splash">';

		this.args.gravity = 0.40;
		this.args.drag    = 0.85;
		this.args.density = 1;

		this.skimSpeed = 15;

		this.draining = 0;
	}

	skim(actor)
	{
		super.skim(actor);

		if(this.viewport.args.frameId % 4)
		{
			return;
		}

		const splashParticle = new Tag(`<div class = "particle-skim">`);
		const splashPoint = actor.rotatePoint(actor.public.gSpeed, 0);

		splashParticle.style({
			'--x': splashPoint[0] + actor.x + actor.args.gSpeed
			, '--y': splashPoint[1] + actor.y
			, 'z-index': 0
			, '--flip': `${actor.args.direction}`
		});

		this.viewport.particles.add(splashParticle);

		this.viewport.onFrameOut(16, () => this.viewport.particles.remove(splashParticle));
	}

	update()
	{
		if(!this.viewport)
		{
			return;
		}

		if(!this.filterWrapper && this.tags.sprite)
		{
			this.filterWrapper = new Tag('<div class = "region-filter-wrapper">');
			this.colorWrapper  = new Tag('<div class = "region-color-wrapper">');

			this.filter = new Tag('<div class = "region-filter">');
			this.color  = new Tag('<div class = "region-color">');

			this.mask = View.from(`<svg style = "width: 100vw;height: 100vh">
				<defs>
					<clipPath id = "mask-${this.args.id}" clipPathUnits="userSpaceOnUse">
	    				<path d="
	    					M 0 0 L 0 ${32 * 17} L ${32 * 17} ${32 * 17} L ${32 * 17} 0 z
	    					M ${32 * 17} 150 L ${32 * 17} 200 L ${32 * 17/2} 175 L ${32 * 17/2} 175 z"

	    				/>
    				</clipPath>
    			</defs>
			<svg>`);

			this.colorWrapper.appendChild(this.color.node);
			this.filterWrapper.appendChild(this.filter.node);

			this.tags.sprite.appendChild(this.colorWrapper.node);
			this.tags.sprite.appendChild(this.filterWrapper.node);
			this.mask.render(this.tags.sprite);

			this.tags.sprite.style({'--maskImage': `url(#mask-${this.args.id})`});
		}

		if(this.args.controller)
		{
			const controller = this.viewport.actorsById[ this.args.controller ];

			if(controller)
			{
				this.args.height = controller.args.level;

				// console.log(controller.args.level);
			}
		}


		if(!this.switch && this.public.switch)
		{
			this.switch = this.viewport.actorsById[ this.public.switch ]

			if(this.switch)
			{
				this.switch.args.bindTo('active', v => {
					if(!v && this.draining > 0)
					{
						// this.draining = -1;
					}

					if(v)
					{
						this.draining = 1;
					}
					else
					{
						this.draining = -1;
					}
				});
			}
		}

		if(!this.originalHeight)
		{
			this.originalHeight = this.public.height;
		}

		if(this.draining)
		{
			if(this.draining > 0 && this.public.height >= 32)
			{
				this.args.height -= 3.5;
			}
			else if(this.draining < 0 && this.public.height < this.originalHeight)
			{
				this.args.height += 3.5;
			}

			if(this.public.height <= 0)
			{
				this.args.display = 'none';

				if(this.draining > 0)
				{
					this.draining = 0;
				}
			}
			else
			{
				this.args.display = 'initial';
			}
		}

		if(this.target && this.args.height !== this.target)
		{
			const space      = this.args.height - this.target;
			const drainSpeed = this.args.drainSpeed ?? 1;
			const fillSpeed  = this.args.fillSpeed  ?? 1;

			const speed = space > 0 ? drainSpeed : fillSpeed;

			if(Math.abs(this.args.height - this.target) > speed)
			{
				this.args.height -= Math.abs(speed) * Math.sign(space);
			}
			else
			{
				this.args.height = this.target;
			}
		}

		super.update();
	}

	updateActor(other)
	{
		if(!other.controllable)
		{
			return;
		}

		if(other.y - other.args.height < this.y - this.args.height)
		{
			return;
		}

		if(this.viewport.args.frameId % 5 === 0 && (Math.random() > 0.9))
		{
			const viewport = this.viewport;

			const bubble = new Tag('<div class = "particle-bubble">');

			const attach = other.rotatePoint(...other.facePoint);

			const x = other.x + attach[0];
			const y = other.y + attach[1];

			bubble.style({'--startY': y, '--size': Math.random()});

			const stopHoldingBubble = this.onFrame(() => {

				const point = other.facePoint;

				const x = other.x + point[0];
				const y = other.y + point[1];

				if(other.y < this.y - this.public.height)
				{
					bubble.style({display: 'none'});
				}

				if(y < this.y - this.public.height)
				{
					bubble.style({display: 'none'});
				}

				bubble.style({'--x': x, '--y': y});
			});

			const stopWatchingBubble = this.onFrame(() => {
				bubble.style({'--maxY': this.y - this.args.height});
			});

			viewport.particles.add(bubble);

			viewport.onTimeout(350, () => {
				bubble.classList.add('float');
				stopHoldingBubble();
			});

			viewport.onTimeout(1000, () => {
				bubble.classList.add('floating');
			});

			setTimeout(() => {
				viewport.particles.remove(bubble);
				stopWatchingBubble();
			}, 1500);

		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
