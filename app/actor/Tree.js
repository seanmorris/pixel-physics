import { PointActor } from './PointActor';
import { Coconut } from './Coconut';
import { Tag } from 'curvature/base/Tag';

export class Tree extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.height = objDef.height;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-tree';

		this.args.z = -1;

		this.args.width  = 80;

		this.args.lean = 0;

		this.args.coconutCount = 4;

		this.args.shakeTime = 0;
	}

	updateEnd()
	{
		super.updateEnd();

		const objects = this.viewport.collisions.get(this);
		let shaking = false;

		if(objects)
		for(const object of objects.keys())
		{
			if(object.args.currentState === 'shakingTree')
			{
				shaking = Math.sign(this.args.x - object.args.x);
			}
		}

		this.args.shaking = shaking;
	}

	update()
	{
		const frame = this.viewport.args.frameId;


		if(this.args.shaking)
		{
			this.args.lean = 2 * (Math.trunc(this.args.shakeTime / 10) % 2) + -1 * this.args.shaking;
			this.args.shakeTime++;
		}
		else
		{
			if(this.viewport.args.frameId - this.args.lastChange > 1200 && this.args.coconutCount < 4)
			{
				this.args.coconutCount++;
				this.args.lastChange = this.viewport.args.frameId;
			}

			this.args.shakeTime = 0;
			this.args.lean = 0;
		}

		if(this.args.shakeTime > 120)
		{
			this.args.shakeTime = -60;
			this.dropFruit();
		}

		super.update();
	}

	onRendered(event)
	{
		super.onRendered(event);

		if(this.box && !this.top)
		{
			this.top = new Tag(`<div class = "tree-top">`);
			this.box.appendChild(this.top.node);
		}

		this.autoStyle.get(this.box)['--count'] = 'coconutCount';
		this.autoStyle.get(this.box)['--lean'] = 'lean';
	}

	collideA(other, type)
	{
		if(!other.controllable)
		{
			return;
		}
		// else
		// {
		// 	this.args.shaking = true;
		// }

		if(Math.abs(other.args.x - this.args.x) > 20)
		{
			return;
		}

		if(other.args.y > this.args.y + -this.args.height + 64)
		{
			return;
		}

		this.ignores.set(other, 45);

		this.dropFruit(other);
	}

	dropFruit(other)
	{
		if(this.args.coconutCount)
		{
			this.args.coconutCount--;

			this.args.lastChange = this.viewport.args.frameId;

			const coconut = new Coconut;

			// coconut.args.ySpeed = -2;
			coconut.args.x = this.args.x;
			coconut.args.y = this.args.y + -this.args.height + 48;

			this.viewport.spawn.add({object:coconut});

			if(other)
			{
				this.viewport.onFrameOut(1, () => coconut.args.xSpeed = other.args.xSpeed || other.args.direction * Math.random() * 2);
				this.args.lean = 5 * Math.sign(other.args.xSpeed);
			}
			else
			{
				this.viewport.onFrameOut(1, () => coconut.args.xSpeed = this.args.lean * 0.5 + this.args.lean * 2.5 * Math.random() );
			}

			this.viewport.onFrameOut(10, () => this.args.lean = 0);
		}
	}

	sleep()
	{
		this.args.coconutCount = 4;
	}

	get solid() { return false; }
}
