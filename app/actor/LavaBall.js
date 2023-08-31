import { PointActor } from './PointActor';

export class LavaBall extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 16;
		this.args.height = 16;
		this.args.float  = 0;
		this.args.type   = 'actor-item actor-lava-ball';

		this.args.jumpForce = 7.25;
		this.args.gravity   = 0.2;
		this.args.density   = 25;
	}

	onRendered()
	{
		super.onRendered()

		this.autoAttr.get(this.box)['data-color'] = 'color';
	}

	update()
	{
		super.update();

		const age = this.viewport.args.frameId + (this.args.offset || 0);

		if(age % 45 === 0)
		{
			this.willJump = true;
		}

		this.args.hidden = !this.willJump && !this.args.falling;
	}

	collideA(other, type)
	{
		if(other.controllable && this.args.falling)
		{
			other.damage(this);
		}

		return super.collideA(other, type);
	}
}
