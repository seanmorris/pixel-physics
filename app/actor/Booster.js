import { PointActor } from './PointActor';

export class Booster extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-booster';

		this.args.xMax = this.args.xMax ?? 24;
		this.args.yMax = this.args.yMax ?? 24;

		this.args.width  = 64;
		this.args.height = 345;

		this.args.float = -1;
	}

	update()
	{
		if(!this.viewport)
		{
			return;
		}

		super.update();

		if(this.args.launched && Math.abs(this.args.xSpeed) < Math.abs(this.args.xMax))
		{
			this.args.xSpeed += 0.5 * Math.sign(this.args.xMax);
		}

		if(this.args.launched && Math.abs(this.args.ySpeed) < Math.abs(this.args.yMax))
		{
			this.args.ySpeed -= 5 * Math.sign(this.args.yMax);
		}

		if(this.args.launched)
		{
			this.args.falling = true;
		}

		if(this.args.launched && this.args.xSpeed === 0 && this.args.ySpeed === 0)
		{
			// this.explode();
		}
	}

	activate()
	{
		console.log('GO!');

		this.args.active = true;

		this.viewport.auras.add(this);

		this.args.launched = true;

		if(this.args.xMax)
		{
			this.args.xSpeed += 0.5;
		}

		if(this.args.yMax)
		{
			this.args.ySpeed -= 0.5;
		}
	}

	explode()
	{
		this.viewport.onFrameOut(60, () => {
			this.args.launched = false;
			this.args.active   = false;

			this.viewport.auras.delete(this);

			this.args.x = this.def.get('x');
			this.args.y = this.def.get('y');

			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
			this.args.gSpeed = 0;

			this.viewport.setColCell(this);

			console.log(this.args.x, this.args.y);
		});
	}
}
