import { PointActor } from './PointActor';
// import { Sfx } from '../audio/Sfx';
// import { Bgm } from '../audio/Bgm';
// import { Tag } from 'curvature/base/Tag';
// import { Block } from './Block';

export class NitroBooster extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width    = 64;
		this.args.height   = 8;
		this.args.float    = -1;
		this.args.type     = 'actor-item actor-nitro-booster';
	}

	onRendered()
	{
		super.onRendered();
	}

	update()
	{
		super.update();

		if(Math.trunc(this.viewport.args.frameId / 6) % 6 < 2 && (this.viewport.args.frameId % 3))
		{
			this.castRayQuick(60, -Math.PI/2, [0, -16]);
			this.args.animation = 'boosting';
		}
		else
		{
			this.args.animation = 'idle';
		}
	}

	collideA(other, type)
	{
		if(!other.controllable)
		{
			return;
		}

		if(this.args.animation === 'boosting')
		{
			other.args.y -= 16;
			other.args.ySpeed  = -16;
			other.args.falling = true;
		}

		// if(type === 0 && other.args.ySpeed >= 0)
		// {
		// 	other.args.ySpeed = (other.args.flying && other.flyTime > 2) ? -2 : -8;
		// 	super.collideA(other, type);
		// 	this.args.pressed = 6;
		// 	return;
		// }

		return super.collideA(other, type);
	}

	get solid() {return true; };
}
