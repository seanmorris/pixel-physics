import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';

export class Menu extends Card
{
	template = require('./main-menu.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.cardName = 'menu';

		this.args.items = {};

		this.currentItem = null;

		this.include = 'a, button, input, textarea, select, details,[tabindex]';
		this.exclude = '[tabindex="-1"]';

		this.onRemove(() => parent.focus());
	}

	onRendered(event)
	{
		this.args.bindTo('items', v => {

			for(const i in v)
			{
				const item = v[i];

				if(item.get)
				{
					item.setting = item.get();
				}
			}
		});

		this.args.bindTo('items', v => {

			if(!v || !Object.keys(v).length)
			{
				return;
			}

			if(this.args.items)
			{
				this.currentItem = null;
			}

			const next = this.findNext(this.currentItem, this.tags.bound.node);

			if(next)
			{
				this.focus(next);
			}

		}, {wait: 10});

		this.focusFirst();
	}

	focusFirst()
	{
		if(!this.tags.bound)
		{
			return;
		}

		const bounds = this.tags.bound;

		const element = this.findNext(null, bounds);

		element && this.focus(element);
	}

	findNext(current, bounds, reverse = false)
	{
		const elements = bounds.querySelectorAll(this.include);

		if(!elements.length)
		{
			return;
		}

		let found = false;
		let first = null;
		let last  = null;

		for(const element of elements)
		{
			if(element.matches(this.exclude))
			{
				continue;
			}

			if(!first)
			{
				if(!current && !reverse)
				{
					return element;
				}

				first = element;
			}

			if(!reverse && found)
			{
				return element;
			}

			if(element === current)
			{
				if(reverse && last)
				{
					return last;
				}

				found = true;
			}

			last = element;
		}

		if(reverse)
		{
			return last;
		}

		return this.findNext(undefined, bounds, reverse);
	}

	focus(element)
	{
		if(this.currentItem && this.currentItem !== element)
		{
			this.blur(this.currentItem);
		}

		if(element)
		{
			element.classList.add('focused');
			element.focus();
		}

		this.currentItem = element;
	}

	blur(element)
	{
		element.classList.remove('focused');
		element.blur();
	}

	input(controller)
	{
		this.zeroMe = controller;

		if(!this.tags.bound)
		{
			return;
		}

		let next;

		if(controller.buttons[12] && controller.buttons[12].time === 1)
		{
			next = this.findNext(this.currentItem, this.tags.bound.node, true);
		}
		else if(controller.buttons[13] && controller.buttons[13].time === 1)
		{
			next = this.findNext(this.currentItem, this.tags.bound.node);

			this.focus(next);
		}
		else if(controller.buttons[14] && controller.buttons[14].time === 1)
		{
			this.currentItem && this.contract(this.currentItem);
		}
		else if(controller.buttons[15] && controller.buttons[15].time === 1)
		{
			this.expand(this.currentItem);
		}

		if(controller.buttons[0] && controller.buttons[0].time === 1)
		{
			this.currentItem && this.currentItem.click();

			this.args.last = 'A';
		}
		else if(controller.buttons[1] && controller.buttons[1].time === 1)
		{
			this.back();

			this.args.last = 'B';
		}

		next && this.onTimeout(100, ()=> this.focus(next));
	}

	run(item)
	{
		if(this.zeroMe)
		{
			this.zeroMe.zero();
		}

		item.callback && this.onTimeout(100, () => item.callback());

		if(item.children)
		{
			const prev = this.args.items;
			const back = {callback: () => {
				this.args.items = prev
				this.onNextFrame(()=>this.focusFirst());
			}};

			this.args.items = item.children;

			this.args.items['back'] = this.args.items['back'] || back;

			this.onNextFrame(()=>this.focusFirst());
		}
	}

	back()
	{
		if(this.args.items['back'])
		{
			this.args.items['back'].callback();
		}
	}

	expand(element)
	{
		const input = element.querySelector('input');
		const title = element.getAttribute('data-title');
		const item  = this.args.items[ title ];

		if(!item)
		{
			return;
		}

		if(item.input === 'number')
		{
			item.setting = Number(item.setting) + 1;

			if(item.setting > item.max)
			{
				item.setting = item.max;
			}

			item.set(item.setting);
		}
		else if(item.input === 'boolean')
		{
			item.setting = !item.setting;
			item.set(item.setting);
		}
		else if(input)
		{
			input.focus();
		}
	}

	contract(element)
	{
		const title = element.getAttribute('data-title');
		const item  = this.args.items[ title ];

		// console.log(element, this.args.items, title, item);

		if(item.input === 'number')
		{
			item.setting = Number(item.setting) - 1;

			if(item.setting < item.min)
			{
				item.setting = item.min;
			}

			item.set(item.setting);
		}
		else if(item.input === 'boolean')
		{
			item.setting = !item.setting;
			item.set(item.setting);
		}
		else
		{
			this.focus(element);
		}
	}

	keyup(event)
	{
		if(event.key === 'ArrowUp' || event.key === 'ArrowDown')
		{
			event.preventDefault();
			event.stopPropagation();

			const next = this.findNext(this.currentItem, this.tags.bound.node, event.key === 'ArrowUp');

			if(next)
			{
				this.focus(next);
			}
		}
	}

	change(event)
	{
		if(!this.currentItem)
		{
			return;
		}

		const title  = this.currentItem.getAttribute('data-title');
		const item   = this.args.items[ title ];

		item.setting = event.target.value;

		item.set(item.setting);
	}

	toggle(event, item, $view, $subview, $parent)
	{
		event.preventDefault();

		item.setting = !item.setting;

		item.set(item.setting);
	}
}
