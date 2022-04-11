import { Tag } from 'curvature/base/Tag';

import { Sfx } from '../audio/Sfx';

import { PointActor } from './PointActor';
import { Ring } from './Ring';
import { AntiRing } from './AntiRing';

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
		if(!other.controllable)
		{
			return;
		}

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

		return new Promise(accept => {
			this.viewport.onFrameOut(85, () => {

				this.args.type = 'actor-item actor-slot-machine';

				if(hand[0] === 1)
				{
					this.onTimeout(30, () => Sfx.play('FAIL'));

					if(other.args.rings > 50)
					{
						return this.punish(other, 10).then(accept);
					}

					return accept();
				}
				else if(hand[0] === 2)
				{
					return this.punish(other, 50).then(accept);

					return accept();
				}
				else if(hand[0] === 3)
				{
					if(other.args.rings > 0)
					{
						other.args.rings = 0;
					}
					else
					{
						return this.punish(other, 100).then(accept);
					}

					return accept();
				}
				else if(hand[5] === 2)
				{
					return this.reward(other, 25).then(accept);
				}
				else if(hand[5] === 3)
				{
					return this.reward(other, 100).then(accept);
				}
				else if(hand[6] === 2)
				{
					return this.reward(other, 50).then(accept);
				}
				else if(hand[6] === 3)
				{
					return this.reward(other, 75).then(accept);
				}
				else if(hand[7] === 2)
				{
					return this.reward(other, 15).then(accept);
				}
				else if(hand[7] === 3)
				{
					return this.reward(other, 20).then(accept);
				}
				else if(hand[2] === 3 || hand[3] === 3 || hand[4] === 3)
				{
					return this.reward(other, 50).then(accept);
				}
				else if(hand[1] === 1)
				{
					return this.reward(other, 2).then(accept);
				}
				else if(hand[1] === 2)
				{
					return this.reward(other, 30).then(accept);
				}
				else if(hand[1] === 3)
				{
					return this.reward(other, 60).then(accept);
				}

				accept();
			});
		})
	}

	reward(other, amount = 100)
	{
		const viewport = this.viewport;

		let angle = -1.57;

		for(let i = 0; i < amount; i++)
		{

			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			const ring = new Ring({
				x: other.x + cos * 288
				, y: other.y + sin * 288
				, xSpeed: -cos * 7
				, ySpeed: -sin * 7
				, static: false
				, reward: true
				, noClip: true
				, float: -1
			});

			viewport.spawn.add({
				object: ring, frame: i * 3 + viewport.args.frameId
			});

			angle += Math.PI + 0.15;
		}

		return new Promise(accept => viewport.onFrameOut((16 + amount) * 3, () => accept()));
	}

	punish(other, amount)
	{
		Sfx.play('FAIL');

		const viewport = this.viewport;

		let angle = -1.57;

		for(let i = 0; i < amount; i++)
		{

			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			const ring = new AntiRing({
				x: other.x + cos * 288
				, y: other.y + sin * 288
				, xSpeed: -cos * 7
				, ySpeed: -sin * 7
				, static: false
				, reward: true
				, noClip: true
				, float: -1
			});

			viewport.spawn.add({
				object: ring, frame: i * 3 + viewport.args.frameId
			});

			angle += Math.PI + 0.15;
		}

		return new Promise(accept => viewport.onFrameOut((16 + amount) * 3, () => accept()));
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
