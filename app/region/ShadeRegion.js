import { Region } from "../actor/Region";
import { CharacterString } from '../ui/CharacterString';

import { Cylinder } from '../effects/Cylinder';
import { Pinch    } from '../effects/Pinch';

import { Tag } from 'curvature/base/Tag';

export class ShadeRegion extends Region
{
	currentFilter = -1;

	filters = [
		'studio', 'runners', 'western', 'hydro', 'heat', 'frost', 'eight-bit', 'corruption', 'black-hole', 'normal'
	];

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-shade';
	}

	onAttached()
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

		this.cylinder = new Cylinder({
			id:'shade-cylinder'
			, width: this.args.width
			, height: this.args.height
		});

		this.cylinder.render(this.tags.sprite);

		this.pinch = new Pinch({
			id:'shade-pinch'
			, width: this.args.width
			, height: this.args.height
		});

		this.pinch.render(this.tags.sprite);

		this.args.bindTo('scale', v => {
			this.pinch.args.scale = v;
			this.cylinder.args.scale = v;
		});

		this.onFrame(() => this.args.scale = 175 - Math.abs(Math.sin(Date.now() / 200) * 25));

		this.rotateFilter();

		if(!this.switch && this.public.switch)
		{
			this.switch = this.viewport.actorsById[ this.public.switch ]

			this.switch.args.bindTo('active', v => {
				if(!v)
				{
				}

				if(v)
				{
					this.rotateFilter();
				}
			});
		}
	}

	update()
	{
		super.update();

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

			this.public.filter && this.mainElem.classList.add(this.public.filter);

			this.text.args.value = '';

			if(this.public.filter)
			{
				this.onNextFrame(()=> this.text.args.value = `${this.currentFilter}: ${this.public.filter}` || '');
			}

		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
