import { Bindable } from "curvature/base/Bindable";
import { Mixin } from "curvature/base/Mixin";
import { EventTargetMixin } from "curvature/mixin/EventTargetMixin";
import { View } from "curvature/base/View";
import { Sfx } from "../audio/Sfx";
import { Bgm } from "../audio/Bgm";

import { TallyCounter } from "./TallyCounter";

import { CharacterString } from '../ui/CharacterString';

export class TallyBoard extends Mixin.with(class{}, EventTargetMixin)
{
	totalLabel = new CharacterString({value: 'Total:', color:'yellow'});
	totalValue = new CharacterString({value: '0'});

	inventoryCounter = new CharacterString({value: '-'});
	inventoryBump = '';
	inventory = Bindable.make([]);
	hasInventory = false;

	counters = Bindable.make([]);
	totaling = false;
	totaled = false;
	total  = 0;
	step = 200;
	age = 0;

	almostDone = false;
	done = false;
	doneAge = 0;

	// constructor(){}

	update(viewport)
	{
		let totaled = true;
		let totaling = false;

		this.hasInventory = !!viewport.args.inventory.length;

		let beat = 15;
		let delay = 30;

		for(const counter of this.counters)
		{
			if(delay + beat + counter.index * beat === this.age)
			{
				Sfx.play('TALLY_SCORE');

				if(!counter.started)
				{

					counter.started = true;
					counter.display.args.value = counter.points;
					counter.display.args.color = 'white';
					counter.bump = 'bump';
				}
			}

			if(delay + 2 * beat + beat * (this.counters.length + viewport.args.inventory.length) + beat * counter.index > this.age)
			{
				totaled = false;
				continue;
			}

			counter.started = true;

			if(counter.display.args.value > 0)
			{
				const inc = Math.min(this.step, counter.display.args.value);
				this.total += inc
				viewport.controlActor.args.score += inc;
				counter.display.args.value = Math.max(0, counter.display.args.value - this.step);
				totaling = true;
				totaled = false;
			}
		}

		let i = 0;

		for(const item of viewport.args.inventory)
		{
			i++;

			if(delay + (this.counters.length + i) * beat > this.age)
			{
				totaled = false;
				continue;
			}

			if(!item.tallied)
			{
				this.inventoryBump = '';

				viewport.onFrameOut(1, () => {
					Sfx.play('TALLY_SCORE');
					this.inventoryBump = 'bump'
				});

				this.inventory.push(item);

				this.inventoryCounter.args.value = (Number(this.inventoryCounter.args.value)||0) + item.points;

				item.tallied = true;
			}
		}

		if(Number(this.inventoryCounter.args.value) > 0)
		{
			if(delay + (this.counters.length + i + 2) * beat + beat * 2 < this.age)
			{
				const inc = Math.min(this.step, (Number(this.inventoryCounter.args.value)||0));
				this.total += inc
				viewport.controlActor.args.score += inc;
				this.inventoryCounter.args.value = Math.max(0, (Number(this.inventoryCounter.args.value)||0) - this.step);
				totaling = true;
			}

			totaled = false;
		}

		if(totaling)
		{
			if(!this.totaling)
			{
				this.dispatchEvent('totalingstarted');
				this.totaling = true;
			}
		}

		if(!totaling)
		{
			if(this.totaling)
			{
				this.dispatchEvent('totalingdone');
				// this.totaling = false;
			}
		}

		this.totaled = totaled;

		if(this.totaled && this.totaling)
		{
			Sfx.play('TOTAL_SCORE');
			this.doneAge = this.age;
		}

		if(this.doneAge && this.age == this.doneAge + 60)
		{
			if(!this.almostDone)
			{
				this.almostDone = true;

				this.dispatchEvent('almostdone');
			}
		}

		if(this.doneAge && this.age > this.doneAge + 120)
		{
			if(!this.done)
			{
				this.done = true;
				this.dispatchEvent('done');
			}
		}

		this.totalValue.args.value = this.total;

		if(totaled)
		{
			this.totaling = false;
		}

		if(this.totaling && !this.totaled)
		{
			Sfx.play('SWITCH_HIT');
		}

		this.age++;
	}

	view()
	{
		return View.from(require('./tally-board.html'), this);
	}

	addCounter({type = 'label', label = 'counter', value = 0, required = true})
	{
		if(!value && !required)
		{
			return;
		}

		const counter = new TallyCounter;

		counter.display = new CharacterString({value:'-', color:'grey'});
		counter.points  = value;
		counter.label   = new CharacterString({value:label, color:'yellow'});
		counter.index   = this.counters.length;

		this.counters.push(counter);

		// console.log(counter);
	}
}
