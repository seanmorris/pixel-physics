import { Mixin } from 'curvature/base/Mixin';

import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';

export class Classifier extends Mixin.with(EventTargetMixin)
{
	constructor(criteria, comparator = (criterion, item) => item instanceof criterion)
	{
		super();

		this.compare = comparator;
		this.index   = new Map;

		for(const i in criteria)
		{
			this.index.set(criteria[i], new Set);
		}
	}

	add(object)
	{
		const before = new CustomEvent('adding', {detail: {object}});

		if(!this.dispatchEvent(before))
		{
			return;
		}

		const indexes = new Set;

		for(const [index, list] of this.index.entries())
		{
			if(this.compare(index, object))
			{
				indexes.add(index);

				list.add(object);
			}
		}

		const after = new CustomEvent('added', {detail: {object, indexes}});

		this.dispatchEvent(after);
	}

	remove(object)
	{
		const before = new CustomEvent('removing', {detail: {object}});

		if(!this.dispatchEvent(before))
		{
			return;
		}

		const indexes = new Set;

		for(const [index,list] of this.index.entries())
		{
			if(this.compare(index, object))
			{
				indexes.add(index);

				list.delete(object);
			}
		}

		const after = new CustomEvent('added', {detail: {object, indexes}});

		this.dispatchEvent(after);
	}

	get(key)
	{
		return this.index.get(key);
	}

	count(key)
	{
		return this.get(key).size;
	}

	has(key)
	{
		return !!this.count(key);
	}
}
