import { PointActor } from './PointActor';

export class WaterController extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.activated = false;

		this.args.levelLimit = this.args.levelLimit || 0;
		this.args.levelSpeed = this.args.levelSpeed || 1;
		this.args.level      = this.args.level || 0;

		this.args.static = true;
		this.args.hidden = true;
	}

	updateStart()
	{
		super.updateStart();

		if(this.args.switch && !this.switch)
		{
			this.switch = this.viewport.actorsById[ this.args.switch ];
		}

		if(this.switch)
		{
			if(this.switch.args.active > 0)
			{
				this.activate(this.switch.activator, this.switch);
			}
		}
	}

	update()
	{
		// if(this.args.activated && this.args.levelSpeed < 18)
		// {
		// 	this.args.levelSpeed += 1;
		// }

		if(this.args.level < this.args._levelLimit)
		{
			this.args.level += this.args.levelSpeed || 0;
		}

		if(this.args.level > this.args._levelLimit)
		{
			this.args.levelSpeed = 0;

			this.args.level = this.args._levelLimit;

			const target = this.viewport.actorsById[ this.args.target ];

			this.viewport.auras.delete(target);
			this.viewport.auras.delete(this);
		}
	}

	activate(other, button)
	{
		if(this.args.activated)
		{
			return;
		}

		this.args._levelLimit = this.args.levelLimit || 4096;

		this.viewport.auras.add(this);

		this.args.activated = true;

		if(this.args.target && this.viewport.actorsById[ this.args.target ])
		{
			const target = this.viewport.actorsById[ this.args.target ];

			this.viewport.auras.add(target);

			target.activate(other, this);
		}
	}
}
