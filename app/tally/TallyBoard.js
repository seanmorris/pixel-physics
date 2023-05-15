import { Bindable } from "curvature/base/Bindable";
import { View } from "curvature/base/View";
import { Sfx } from "../audio/Sfx";
import { Bgm } from "../audio/Bgm";

import { TallyCounter } from "./TallyCounter";

import { CharacterString } from '../ui/CharacterString';

export class TallyBoard
{
	totalLabel = new CharacterString({value: 'Total:', color:'yellow'});
	totalValue = new CharacterString({value: '0'});

	counters = Bindable.make([]);
	totaling = false;
	totaled = false;
	total  = 0;
	step = 200;
	age = 0;

	almostDone = false;
	done = false;
	doneAge = 0;

	update(viewport)
	{
		let totaled = true;

		let beat = 15;
		let delay = 30;

		for(const counter of this.counters)
		{
			if(delay + -1 + beat + counter.index * beat === this.age)
			{
				Sfx.play('TALLY_SCORE');
			}

			if(delay + 0.5 * beat + counter.index * beat > this.age)
			{
				totaled = false;
				continue;
			}

			if(!counter.started)
			{
				counter.started = true;
				counter.display.args.value = counter.points;
				counter.display.args.color = 'white';
				counter.bump = 'bump';
			}

			if(delay + 2 * beat + beat * this.counters.length + beat * counter.index > this.age)
			{
				totaled = false;
				continue;
			}

			counter.started = true;

			if(counter.display.args.value > 0)
			{
				const inc = Math.min(this.step, counter.display.args.value);;
				this.total += inc
				viewport.controlActor.args.score += inc;
				counter.display.args.value = Math.max(0, counter.display.args.value - this.step);
				this.totaling = true;
				totaled = false;
			}
		}

		this.totaled = totaled;

		if(this.totaled && this.totaling)
		{
			Sfx.play('TOTAL_SCORE');
			this.doneAge = this.age;
		}

		if(this.doneAge && this.age > this.doneAge + 120)
		{
			this.done = true;
		}

		if(this.doneAge && this.age == this.doneAge + 60)
		{
			this.almostDone = true;
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

		console.log(counter);
	}
}
