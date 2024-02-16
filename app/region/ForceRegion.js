import { Region } from "./Region";
export class ForceRegion extends Region
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'region region-force';

		this.args.xForce = this.args.xForce ?? 0;
		this.args.yForce = this.args.yForce ?? -5;

		this.args.active = this.args.active ?? 1;
	}

	update()
	{
		if(!this.originalHeight)
		{
			this.originalHeight = this.args.height;
		}

		if(this.switch)
		{
			this.args.active = this.switch.args.active > 0;
		}

		super.update();
	}

	onAttach()
	{
		if(!this.viewport || !this.args.switch)
		{
			return;
		}
	}

	wakeUp()
	{
		this.switch = this.viewport.actorsById[ this.args.switch ];
	}

	activate()
	{
		this.args.active = 1;
	}

	updateActor(other)
	{
		if(other instanceof Region || other.args.static)
		{
			return;
		}

		if(this.args.active <= 0)
		{
			return;
		}

		if(other.args.falling)
		{
			const xProjected = other.args.xSpeed + Number(this.args.xForce);

			if(Math.abs(xProjected) > Math.abs(this.args.xForceMax) && Math.sign(this.args.xForceMax) === Math.sign(xProjected))
			{
				other.args.xSpeed = this.args.xForceMax;
			}
			else
			{
				other.args.xSpeed = xProjected;
			}

			const yProjected = other.args.ySpeed + Number(this.args.yForce)

			if(Math.abs(yProjected) > Math.abs(this.args.yForceMax) && Math.sign(this.args.yForceMax) === Math.sign(yProjected))
			{

				if(Math.abs(yProjected) >= other.args.gravity || other.args.falling)
				{
					other.args.ySpeed = this.args.yForceMax;
				}
			}
			else
			{
				other.args.ySpeed = yProjected;
			}

			// other.args.animation = 'springdash';
			other.args.groundAngle = 0;

			return;
		}

		let projected;

		switch(other.args.mode)
		{
			case 0:
				projected = other.args.gSpeed + this.args.xForce;

				if(Math.abs(projected) > Math.abs(this.args.xForceMax) && Math.sign(this.args.xForceMax) === Math.sign(projected))
				{
					other.args.gSpeed = this.args.xForceMax;
				}
				else
				{
					other.args.gSpeed = projected;
				}

				break;


			case 1:

				other.args.gSpeed += Math.sign(this.args.yForce);

				break;

			case 2:

				other.args.gSpeed -= Math.sign(this.args.xForce);

				break;


			case 3:

				other.args.gSpeed -= Math.sign(this.args.yForce);

				break;
		}

	}

	get solid() { return false; }
	get isEffect() { return true; }
}
