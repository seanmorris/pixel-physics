import { Region } from "../actor/Region";
import { CharacterString } from '../ui/CharacterString';

import { Tag } from 'curvature/base/Tag';

export class ShadeRegion extends Region
{
	currentFilter = -1;

	filters = [
		'studio', 'runners', 'old-west', 'water', 'heat', 'eight-bit', 'corruption'
	];

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-shade';
	}

	update()
	{
		super.update();

		if(!this.filterWrapper && this.tags.sprite)
		{
			this.filterWrapper = new Tag('<div class = "region-filter-wrapper">');
			this.colorWrapper  = new Tag('<div class = "region-color-wrapper">');

			this.filter = new Tag('<div class = "region-filter">');
			this.color  = new Tag('<div class = "region-color">');

			this.filterWrapper.appendChild(this.filter.node);
			this.colorWrapper.appendChild(this.color.node);

			this.mainElem = this.tags.sprite.parentNode;

			this.tags.sprite.appendChild(this.filterWrapper.node);
			this.mainElem.appendChild(this.colorWrapper.node);

			this.text = new CharacterString({value:'null'});

			this.text.render(this.tags.sprite);

			this.rotateFilter();
		}

		if(!this.switch && this.public.switch)
		{
			this.switch = this.viewport.actorsById[ this.public.switch ]

			this.switch.args.bindTo('active', v => {
				if(!v)
				{
					console.log('switch off');
				}

				if(v)
				{
					this.rotateFilter();
				}
			});
		}
	}

	rotateFilter()
	{
		if(this.mainElem && this.public.filter)
		{
			this.mainElem.classList.remove(this.public.filter);
		}

		if(this.mainElem)
		{
			this.args.filter = this.filters[ this.currentFilter++ ];

			if(this.currentFilter >= this.filters.length)
			{
				this.currentFilter = 0;
			}

			this.mainElem.classList.add(this.public.filter);

			this.text.args.value = '';

			this.onNextFrame(()=> this.text.args.value = this.public.filter || '');
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
