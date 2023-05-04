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

		this.skimParticles = new Map;
	}

	skim(actor)
	{
		super.skim(actor);

		if(this.viewport.args.frameId % this.viewport.settings.frameSkip !== 0)
		{
			return;
		}

		const splashPoint = actor.rotatePoint(actor.args.gSpeed, 3);

		if(this.skimParticles.has(actor))
		{
			const stuff = this.skimParticles.get(actor);
			const {skimParticle, timeout} = stuff;
			timeout();
			const newTimeout = this.viewport.onFrameOut(2, () => {
				this.viewport.particles.remove(skimParticle);
				this.skimParticles.delete(actor);
			});
			stuff.timeout = newTimeout;
			skimParticle.style({
				'--x': splashPoint[0] + actor.x
				, '--y': splashPoint[1] + actor.y
				, 'z-index': 0
				, '--flip': `${Math.sign(actor.args.gSpeed)}`
			});
			return;
		}

		if(this.viewport)
		{
			const skimParticle = new Tag(`<div class = "particle-skim">`);
			this.viewport.particles.add(skimParticle);

			const timeout = this.viewport.onFrameOut(2, () => {
				this.viewport.particles.remove(skimParticle)
				this.skimParticles.delete(actor);
			});
			this.skimParticles.set(actor, {skimParticle, timeout});
		}
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


			this.colorWrapper.appendChild(this.color.node);
			this.filterWrapper.appendChild(this.filter.node);

			this.tags.sprite.appendChild(this.colorWrapper.node);
			this.tags.sprite.appendChild(this.filterWrapper.node);
		}

		if(this.args.controller)
		{
			const controller = this.viewport.actorsById[ this.args.controller ];

			if(controller)
			{
				this.args.height = controller.args.level;
			}
		}

		if(!this.switch && this.args.switch)
		{
			this.switch = this.viewport.actorsById[ this.args.switch ];

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
			this.originalHeight = this.args.height;
		}

		if(this.draining)
		{
			if(this.draining > 0 && this.args.height >= 32)
			{
				this.args.height -= 3.5;
			}
			else if(this.draining < 0 && this.args.height < this.originalHeight)
			{
				this.args.height += 3.5;
			}

			if(this.args.height <= 0)
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

	updateEnd()
	{
		super.updateEnd();

		if(this.viewport.args.frameId % this.viewport.settings.frameSkip !== 0)
		{
			return;
		}

		for(const [actor, {skimParticle}] of this.skimParticles)
		{
			const splashPoint = actor.rotatePoint(0, 3);

			skimParticle.style({
				'--x': splashPoint[0] + actor.x + -32 * Math.sign(actor.args.gSpeed)
				, '--y': splashPoint[1] + actor.y
				, 'z-index': 0
				, '--flip': `${Math.sign(actor.args.gSpeed)}`
			});
		}
	}

	updateActor(other)
	{
		if(!other.controllable)
		{
			return;
		}

		if(other.args.y - other.args.height < this.args.y - this.args.height)
		{
			return;
		}

		if(this.viewport.args.frameId % 5 === 0 && (Math.random() > 0.9))
		{
			const viewport = this.viewport;

			const bubble = new Tag('<div class = "particle-bubble">');

			const attach = other.rotatePoint(...other.facePoint);

			const x = other.args.x + attach[0];
			const y = other.args.y + attach[1];

			bubble.style({'--startY': y, '--size': Math.random()});

			const stopHoldingBubble = viewport.onFrameInterval(1, () => {

				const point = other.facePoint;

				const x = other.args.x + point[0];
				const y = other.args.y + point[1];

				if(other.args.y < this.args.y - this.args.height)
				{
					bubble.style({display: 'none'});
				}

				if(y < this.args.y - this.args.height)
				{
					bubble.style({display: 'none'});
				}

				bubble.style({'--x': x, '--y': y});
			});

			const stopWatchingBubble = viewport.onFrameInterval(1, () => {
				bubble.style({'--maxY': this.args.y - this.args.height});
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
