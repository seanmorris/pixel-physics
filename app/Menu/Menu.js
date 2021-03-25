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

		this.selector = 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';

		this.onRemove(() => parent.focus());
	}

	onRendered(event)
	{
		this.focusFirst();
	}

	focusFirst()
	{
		if(!this.tags.bound)
		{
			return;
		}

		const bounds = this.tags.bound;

		this.args.bindTo('items', v => {

			if(!v || !Object.keys(v).length)
			{
				return;
			}

			const next = this.findNext(this.currentItem, this.tags.bound.node);

			if(next)
			{
				this.focus(next);
			}

		}, {frame: 1});
	}

	findNext(current, bounds, reverse = false)
	{
		const elements = bounds.querySelectorAll(this.selector);

		if(!elements.length)
		{
			return;
		}

		let found = false;
		let first = null;
		let last  = null;

		for(const element of elements)
		{
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
		if(element)
		{
			element.classList.add('focused');
			element.focus();
		}

		if(this.currentItem && this.currentItem !== element)
		{
			this.blur(this.currentItem);
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
			this.args.last = 'LEFT';
		}
		else if(controller.buttons[15] && controller.buttons[15].time === 1)
		{
			this.args.last = 'RIGHT';
		}

		if(controller.buttons[0] && controller.buttons[0].time === 1)
		{
			this.currentItem && this.currentItem.click()

			this.args.last = 'A';
		}
		else if(controller.buttons[1] && controller.buttons[1].time === 1)
		{
			this.back();

			this.args.last = 'B';
		}

		next && this.onNextFrame(()=> this.focus(next));
	}

	run(item)
	{
		item.callback && item.callback();

		if(item.children)
		{
			const prev = this.args.items;
			const back = {callback: () => this.args.items = prev};

			this.args.items = item.children;

			this.args.items['back'] = this.args.items['back'] || back;
		}
	}

	back()
	{
		if(this.args.items['back'])
		{
			this.args.items['back'].callback();
		}
	}
}
