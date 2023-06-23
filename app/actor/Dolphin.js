import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
// import { Sfx } from '../audio/Sfx';

export class Dolphin extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-dolphin';

		this.args.width   = 64;
		this.args.height  = 64;
		this.args.gravity = 0.4;

		this.noClip = true;
		this.args.float = -1;
	}

	update()
	{
		if(!this.viewport || !this.viewport.controlActor)
		{
			return;
		}

		const controlActor = this.viewport.controlActor;

		if(this.args.ySpeed < -4)
		{
			this.args.type = 'actor-item actor-dolphin';
		}
		else
		{
			this.args.type = 'actor-item actor-dolphin actor-dolphin-downward';
		}

		if(!this.args.ySpeed && this.args.x < -128 + controlActor.args.x)
		{
			this.args.falling = true;
			this.args.xSpeed  = 6 + (controlActor.args.xSpeed || controlActor.args.gSpeed);
			this.args.ySpeed  = -16;
			this.args.float   = 0;
		}

		super.update();
	}
}
