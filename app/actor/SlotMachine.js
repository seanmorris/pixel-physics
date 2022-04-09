import { Tag } from 'curvature/base/Tag';

import { PointActor } from './PointActor';

export class SlotMachine extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 96;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-slot-machine';
		this.args.float  = -1;
	}

	onRendered(event)
	{
		super.onRendered(event);

		if(!this.boxes)
		{
			this.boxes = [
				  new Tag(`<div class = "slot-panel slot-panel-a">`)
				, new Tag(`<div class = "slot-panel slot-panel-b">`)
				, new Tag(`<div class = "slot-panel slot-panel-c">`)
			];

			this.boxes.forEach(box => this.box.appendChild(box.node));
		}
	}

	dropDelay(other)
	{
		this.args.type = 'actor-item actor-slot-machine actor-slot-machine-rolling';

		const pos  = Symbol;
		const hand = Array(8).fill(0);

		const result = this.boxes.map(box => {

			box[pos] = box[pos] || 0;

			const scrollTo = 32 + box[pos] + Math.floor(Math.random() * 8);

			box.style({
				'--scrollTo': (scrollTo * 32) + 'px'
			})

			box[pos] = scrollTo;

			return box[pos] % 8;
		});

		result.forEach(v => hand[v]++);

		return new Promise(accept => this.viewport.onFrameOut(85, () => {

			this.args.type = 'actor-item actor-slot-machine';

			if(hand[0] === 1)
			{
			}
			else if(hand[0] === 2)
			{
				other.args.rings -= 50;
			}
			else if(hand[0] === 3)
			{
				if(other.args.rings > 0)
				{
					other.args.rings = 0;
				}
			}
			else if(hand[5] === 2)
			{
				other.args.rings += 25;
			}
			else if(hand[5] === 3)
			{
				other.args.rings += 100;
			}
			else if(hand[6] === 2)
			{
				other.args.rings += 50;
			}
			else if(hand[6] === 3)
			{
				other.args.rings += 75;
			}
			else if(hand[7] === 2)
			{
				other.args.rings += 15;
			}
			else if(hand[7] === 3)
			{
				other.args.rings += 20;
			}
			else if(hand[2] === 3 || hand[3] === 3 || hand[4] === 3)
			{
				other.args.rings += 50;
			}
			else if(hand[1] === 1)
			{
				other.args.rings += 1;
			}
			else if(hand[1] === 2)
			{
				other.args.rings += 30;
			}
			else if(hand[1] === 3)
			{
				other.args.rings += 60;
			}

			accept();
		}));
	}

	get solid() { return false; }
}

/*
0 - robotnik
1 - ring
2 - tails
3 - knuckles
4 - sonic
5 - jackpot
6 - emerald
7 - bar
*/
