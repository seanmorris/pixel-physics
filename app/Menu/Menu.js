import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';
import { CharacterString } from '../ui/CharacterString';

export class Menu extends Card
{
	template = require('./main-menu.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.font = 'small-menu-font';
		// this.font = 'font';

		this.args.cardName = 'menu';

		this.args.items = {};

		this.currentItem = null;

		this.include = 'a, button, input, textarea, select, details, [tabindex]';
		this.exclude = '[tabindex="-1"]';

		this.onRemove(() => parent.focus());

		this.tickSample = new Audio('/Sonic/switch-activated.wav');
	}

	onRendered(event)
	{
		this.args.bindTo('items', v => {

			for(const i in v)
			{
				const item = v[i];

				item._title = new CharacterString({
					value:i, font: this.font
				});

				item._value = new CharacterString({
					value: ''
					, font: this.font
				});

				if(item.get)
				{
					item.setting = item.get();
				}

				if(item.input === 'boolean')
				{
					item._value.args.value = item.setting ? 'ON' : 'OFF';
					item._boolValue = item._value;
				}
				else if(item.input === 'select')
				{
					item._selectValue = item._value;
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

		const element = this.findNext(null, this.tags.bound);

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

			if(this.parent.args.audio)
			{
				this.tickSample.currentTime = 0;

				this.tickSample.volume = 0.2 + 0.2 * Math.random();

				this.tickSample.play();
			}
		}
		else if(controller.buttons[13] && controller.buttons[13].time === 1)
		{
			next = this.findNext(this.currentItem, this.tags.bound.node);

			if(this.parent.args.audio)
			{
				this.tickSample.currentTime = 0;

				this.tickSample.volume = 0.2 + 0.2 * Math.random();

				this.tickSample.play();
			}

			this.focus(next);
		}
		else if(controller.buttons[14] && controller.buttons[14].time === 1)
		{
			this.currentItem && this.contract(this.currentItem);

			if(this.parent.args.audio)
			{
				this.tickSample.currentTime = 0;

				this.tickSample.volume = 0.2 + 0.2 * Math.random();

				this.tickSample.play();
			}
		}
		else if(controller.buttons[15] && controller.buttons[15].time === 1)
		{
			this.currentItem && this.expand(this.currentItem);

			if(this.parent.args.audio)
			{
				this.tickSample.currentTime = 0;

				this.tickSample.volume = 0.2 + 0.2 * Math.random();

				this.tickSample.play();
			}
		}

		if(controller.buttons[0] && controller.buttons[0].time === 1)
		{
			this.currentItem && this.currentItem.click();

			this.args.last = 'A';

			if(this.parent.args.audio)
			{
				this.tickSample.currentTime = 0;

				this.tickSample.volume = 0.2 + 0.2 * Math.random();

				this.tickSample.play();
			}
		}
		else if(controller.buttons[1] && controller.buttons[1].time === 1)
		{
			this.back();

			this.args.last = 'B';

			if(this.parent.args.audio)
			{
				this.tickSample.currentTime = 0;

				this.tickSample.volume = 0.2 + 0.2 * Math.random();

				this.tickSample.play();
			}
		}

		next && this.onTimeout(100, ()=> this.focus(next));
	}

	run(item, event)
	{
		if(this.zeroMe)
		{
			this.zeroMe.zero();
		}

		if(item.available === 'unavailable')
		{
			return;
		}

		if(item.input)
		{
			event.currentTarget.focus();
			this.focus(event.currentTarget);
		}

		if(item.children)
		{
			const prev = this.args.items;
			const back = {
				_title: new CharacterString({
					value:'back', font: 'small-menu-font'
				})
				, callback: () => {
					this.args.items = prev
					this.args.currentKey = prev._title ? prev._title.args.value : '';
					this.onNextFrame(()=>this.focusFirst());
				}
			};

			this.args.items = item.children;

			this.args.currentKey = item._title.args.value;

			this.args.items['back'] = this.args.items['back'] || back;

			this.onNextFrame(()=>this.focusFirst());
		}

		if(item.callback)
		{
			item.callback();
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

			item.set && item.set(item.setting);
		}
		else if(item.input === 'boolean')
		{
			item.setting = !item.setting;
			item._value.args.value = item.setting ? 'ON' : 'OFF';
			item.set && item.set(item.setting);
		}
		else if(item && item.input === 'select')
		{
			this.cycleSelect(item, title, 1);
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

			item.set && item.set(item.setting);
		}
		else if(item.input === 'boolean')
		{
			item.setting = !item.setting;
			item._value.args.value = item.setting ? 'ON' : 'OFF';
			item.set && item.set(item.setting);
		}
		else if(item && item.input === 'select')
		{
			this.cycleSelect(item, title, -1);
		}
		else
		{
			this.focus(element);
		}
	}

	keyup(event, item)
	{
		if(event.key === 'ArrowUp' || event.key === 'ArrowDown')
		{
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();

			if(event.currentTarget.tagName === 'INPUT')
			{
				const next = this.findNext(this.currentItem, this.tags.bound.node, event.key === 'ArrowUp');

				if(next)
				{
					this.focus(next);
					return;
				}
			}
		}

		// if(item && item.input === 'select')
		// {
		// 	event.preventDefault();
		// 	event.stopPropagation();
		// 	event.stopImmediatePropagation();

		// 	if(event.key === 'ArrowLeft')
		// 	{
		// 		this.cycleSelect(item, -1);
		// 	}

		// 	if(event.key === 'ArrowRight')
		// 	{
		// 		this.cycleSelect(item, 1);
		// 	}
		// }
	}

	change(event, title)
	{
		// if(!this.currentItem)
		// {
		// 	return;
		// }

		// const title  = this.currentItem.getAttribute('data-title');
		const item   = this.args.items[ title ];

		item.setting = event.target.value;

		this.selectListChanged(item, title);

		item.set(item.setting);
	}

	toggle(event, item, $view, $subview, $parent)
	{
		event.preventDefault();

		// item.setting = !item.setting;

		// this.selectListChanged(item, title);

		// item.set(item.setting);

		item.setting = !item.setting;
		item._value.args.value = item.setting ? 'ON' : 'OFF';
		item.set && item.set(item.setting);
	}

	cycleSelect(item, title, direction = 1)
	{
		let found = false;
		let first = undefined;
		let last  = undefined;

		const options = [];

		Object.assign(options, item.options);

		if(direction === -1)
		{
			options.reverse();
		}
		else if(direction !== 1)
		{
			return;
		}

		for(const option of options)
		{
			first = first ?? option;

			if(option === item.setting)
			{
				found = true;
				continue;
			}

			if(found)
			{
				item.setting = option;
				last = undefined;
				break;
			}

			last = option;
		}

		if(last !== undefined)
		{
			item.setting = first;
		}

		this.selectListChanged(item, title);

		item.set(item.setting);
	}

	selectListRendered(event, item, title, $view, $subview, $parent)
	{
		console.log(item.input);

		if(item.input === 'select')
		{
			item.setting = (item.get ? item.get() : 'Sonic') ?? 'Sonic';

			let selectedIndex = 0;

			for(const i in item.options)
			{
				if(item.options[i] === item.setting)
				{
					selectedIndex = i;
				}
			}

			const selectTag = $subview.findTag('select');
			const optionTag = $subview.findTag('option');

			selectTag.selectedIndex = selectedIndex;

			item._value.args.value = item.setting;

			this.selectListChanged(item, title, true);
		}
		else if(item.input === 'boolean')
		{
			item.element.selectedIndex = item.setting ? 0 : 1;
			item._value.args.value     = item.setting ? 'ON' : 'OFF';
		}
	}

	selectListChanged(item, title, silent = false)
	{
		if(item.input === 'boolean')
		{
			item._value.args.value = item.setting ? 'ON' : 'OFF';

			this.selectListChanged(item, title, true);
		}
		else if(item.input === 'select')
		{
			if(item._value)
			{
				if(item.locked && item.locked.includes(item.setting))
				{
					item._value.args.value = 'Locked';
				}
				else
				{
					item._value.args.value = item.setting;
				}
			}
		}

		if(title === 'Character')
		{
			for(const _item of Object.values(this.args.items))
			{
				_item._available = _item._available ?? _item.available ?? 'available';


				if(_item.characters && !_item.characters.includes(item.setting))
				{
					_item.available = 'unavailable';
				}
				else
				{
					_item.available = _item._available;
				}
			}
		}

		if(this.parent.args.audio && !silent)
		{
			this.tickSample.currentTime = 0;

			this.tickSample.volume = 0.2 + 0.2 * Math.random();

			this.tickSample.play();
		}
	}
}
