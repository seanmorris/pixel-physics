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

		this.args.coconutCount = 4;
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
	}

	collideA(other, type)
	{
		if(!other.controllable)
		{
			return;
		}

		if(Math.abs(other.args.x - this.args.x) > 20)
		{
			return;
		}

		if(other.args.y > this.args.y + -this.args.height + 64)
		{
			return;
		}

		this.ignores.set(other, 45);

		if(this.args.coconutCount)
		{
			this.args.coconutCount--;

			const coconut = new Coconut;

			// coconut.args.ySpeed = -2;
			coconut.args.x = this.args.x;
			coconut.args.y = this.args.y + -this.args.height + 48;

			this.viewport.spawn.add({object:coconut});

			this.viewport.onFrameOut(1, () => coconut.args.xSpeed = other.args.xSpeed || other.args.direction * Math.random() * 2);
		}
	}

	sleep()
	{
		this.args.coconutCount = 4;
	}

	get solid() { return false; }
}
