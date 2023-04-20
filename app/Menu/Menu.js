import { Bindable } from 'curvature/base/Bindable';

import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';
import { CharacterString } from '../ui/CharacterString';

import { Sfx } from '../audio/Sfx';

const Bindings = Symbol('bindings');

export class Menu extends Card
{
	template = require('./main-menu.html');

	constructor(args,parent)
	{
		args[ Bindable.NoGetters ] = true;
		super(args,parent);
		this[ Bindable.NoGetters ] = true;

		this.font = 'small-menu-font';
		// this.font = 'font';

		this.args.initialPath = [];

		this.args.cardName = 'menu';

		this.args.items = {};

		this.currentItem = null;

		this.include = 'a, button, input, textarea, select, details, [tabindex]';
		this.exclude = '[tabindex="-1"]';

		this.onRemove(() => parent.focus());
	}

	onRendered(event)
	{
		this.listen(window, 'focus', event => this.refocus(event));

		this.args.bindTo('items', v => {

			for(const i in this.args.items)
			{
				const item = this.args.items[i];

				if(item[Bindings])
				{
					[...item[Bindings]].forEach(b => b());
				}
			}

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
					item._value.args.value = item.setting;
					item._selectValue = item._value;
				}
				else if(item.input === 'output')
				{
					const bindable = Bindable.make(item);

					item[Bindings] = item[Bindings] ?? new Set;

					item[Bindings].add(bindable.bindTo('setting', v => item._value.args.value = v));

					if(item.bind)
					{
						item[Bindings].add(item.bind(Bindable.make(item)));
					}
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

		}, {wait: 0});

		this.focusFirst();
	}

	onAttached(event)
	{
		const autoNav = () => {
			if(this.args.initialPath.length)
			{
				const item = this.args.initialPath.shift();

				if(item in this.args.items)
				{
					this.onTimeout(0, () => this.run(this.args.items[item]));
					if(this.args.initialPath.length)
					{
						this.onTimeout(0, () => autoNav());
					}
				}
			}
		}

		this.onTimeout(0, () => autoNav());
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

	refocus(event)
	{
		this.onNextFrame(() => {
			if(!this.currentItem)
			{
				this.focusFirst();
			}

			this.focus(this.currentItem, true);
		});
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

	handleFocus(event)
	{
		this.focus(event.target, true);
	}

	focus(element, force = false)
	{
		if(!force && this.currentItem && this.currentItem !== element)
		{
			this.blur(this.currentItem);
		}

		if(element)
		{
			element.scrollIntoView({behavior: 'smooth', block: 'center'});
			element.classList.add('focused');
			element.focus();


			element.addEventListener('blur', () => this.blur(element), {once:true});
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

		if(this.args.override)
		{
			this.args.override.input(controller);
			return;
		}

		if(controller.buttons[0] && controller.buttons[0].time === 1)
		{
			this.currentItem && this.currentItem.click();

			this.args.last = 'A';

			next = this.currentItem;

			this.beep();
		}
		else if(controller.buttons[1] && controller.buttons[1].time === 1)
		{
			this.back();

			this.args.last = 'B';

			this.beep();
		}
		else if(controller.buttons[3] && controller.buttons[3].time === 30)
		{
			this.currentItem && this.currentItem.dispatchEvent(new MouseEvent('auxclick', {button:1}));

			this.args.last = 'Y';

			this.beep();
		}

		let next;

		const repeatCheck = (button) => controller.buttons[button]
			&& (controller.buttons[button].time === 1
			|| (controller.buttons[button].time >= 140
				&& controller.buttons[button].time % 5 === 1
			)
			|| (controller.buttons[button].time > 30
				&& controller.buttons[button].time < 140
				&& controller.buttons[button].time % 15 === 1
			));

		if(repeatCheck(12) || (controller.axes[7] && controller.axes[7].magnitude < 0 && controller.axes[7].delta))
		{
			next = this.findNext(this.currentItem, this.tags.bound.node, true);

			this.beep();
		}
		else if(repeatCheck(13) || (controller.axes[7] && controller.axes[7].magnitude > 0 && controller.axes[7].delta))
		{
			next = this.findNext(this.currentItem, this.tags.bound.node);

			this.focus(next);

			this.beep();
		}
		else if(repeatCheck(14) || (controller.axes[6] && controller.axes[6].magnitude < 0 && controller.axes[6].delta))
		{
			this.currentItem && this.contract(this.currentItem);

			this.beep();
		}
		else if(repeatCheck(15) || (controller.axes[6] && controller.axes[6].magnitude > 0 && controller.axes[6].delta))
		{
			this.currentItem && this.expand(this.currentItem);

			this.beep();
		}

		next && this.focus(next);
	}

	beep()
	{
		if(!this.parent.args.audio)
		{
			return;
		}

		Sfx.play('SWITCH_HIT');
	}

	run(item, event)
	{
		if(event && event.target)
		{
			let element = event.target;

			while(element && element.matches)
			{
				if(element.matches('[data-click-barrier]'))
				{
					return;
				}

				element = element.parentNode;
			}
		}

		if(this.zeroMe)
		{
			this.zeroMe.zero();
		}

		if(item.available === 'unavailable')
		{
			return;
		}

		if(event && item.input)
		{
			this.onNextFrame(()=>this.focus(event.target.closest('li')));
		}

		if(item.callback)
		{
			item.callback(item, this);
		}

		if(item.children)
		{
			let getChildren = item.children;

			if(typeof item.children === 'function')
			{
				getChildren = item.children(parent);
			}

			if(!(getChildren instanceof Promise))
			{
				getChildren = Promise.resolve(getChildren);
			}

			const prev = this.args.items;

			const back = {
				_title: new CharacterString({
					value:'back', font: 'small-menu-font'
				})
				, callback: () => {
					this.args.items = prev;
					this.args.currentKey = prev._title ? prev._title.args.value : '';
					this.onNextFrame(()=>this.focusFirst());
				}
			};

			this.args.items = {};

			getChildren.catch(error => {
				this.args.items['back'] = this.args.items['back'] || back;
			});

			getChildren.then(children => {
				this.args.items = children;
				this.args.currentKey = item._title.args.value;
				this.args.items['back'] = this.args.items['back'] || back;
				this.onNextFrame(()=>this.focusFirst());
			});
		}
	}

	altRun(item, event)
	{
		if(!event || event.button !== 1)
		{
			return;
		}

		if(item.revert)
		{
			item.revert(item, this);

			if(item.get)
			{
				item.setting = item.get();
			}
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

		if(!item)
		{
			return;
		}

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
	}

	change(event, title)
	{
		const item = this.args.items[ title ];

		if(!item)
		{
			return;
		}

		item.setting = event.target.value;

		this.selectListChanged(item, title);

		item.set(item.setting);
	}

	toggle(event, item)
	{
		event && event.preventDefault();

		item.setting = !item.setting;
		item._value.args.value = item.setting ? 'ON' : 'OFF';
		item.set && item.set(item.setting);
	}

	cancel(event)
	{
		event.preventDefault();
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
		if(item.input === 'select')
		{
			item.setting = (item.get ? item.get() : item.default) ?? undefined;

			let selectedIndex = 0;

			for(const i in item.options)
			{
				if(item.options[i] === item.setting)
				{
					selectedIndex = i;
				}
			}

			if(item.setting === undefined && item.options.length)
			{
				selectedIndex = 0;

				item.setting = item.options[0];
			}

			const selectTag = $subview.findTag('select');
			const optionTag = $subview.findTag('option');

			selectTag.selectedIndex = selectedIndex;

			item._value.args.value = item.setting;

			this.selectListChanged(item, title, true);
		}
		else if(item.input === 'boolean')
		{
			if(item.element)
			{
				item.element.selectedIndex = item.setting ? 0 : 1;
				item._value.args.value     = item.setting ? 'ON' : 'OFF';
			}
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
			this.beep();
		}
	}
}
