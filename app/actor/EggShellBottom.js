import { PointActor } from './PointActor';

export class EggShellBottom extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-egg-shell-bottom';

		this.args.width  = 15;
		this.args.height = 20;

		// this.bindTo('carriedBy', carrier => {
		// 	if(this.cX) { this.cX(); this.cX = null; }
		// 	if(this.cY) { this.cY(); this.cY = null; }
		// 	if(carrier)
		// 	{
		// 		this.cX = carrier.args.bindTo('x', v => this.args.x = v + carrier.args.direction * 12);
		// 		this.cY = carrier.args.bindTo('y', v => this.args.y = v + -12);

		// 		carrier.carrying.add(this);

		// 		this.args.float = -1;
		// 	}
		// 	else if(this.carriedBy)
		// 	{
		// 		const carrier = this.carriedBy;

		// 		this.carriedBy = null;

		// 		this.args.xSpeed = carrier.args.xSpeed;
		// 		this.args.ySpeed = carrier.args.ySpeed;

		// 		this.args.xSpeed += Math.sign(carrier.args.gSpeed || carrier.args.xSpeed) * 4;
		// 		this.args.ySpeed -= 4;

		// 		carrier.carrying.delete(this);

		// 		this.args.falling = true;
		// 		this.args.float = 0;
		// 	}
		// });
	}

	update()
	{
		this.args.startFrame = this.args.startFrame || this.viewport.args.frameId;

		if(this.viewport.args.frameId - this.args.startFrame > 45)
		{
			this.viewport.actors.remove(this);
			return;
		}

		super.update();
	}

	// lift(actor)
	// {
	// 	if(this.carriedBy === actor)
	// 	{
	// 		this.carriedBy = null;

	// 		return;
	// 	}

	// 	this.carriedBy = actor;
	// }

	get solid() { return false; }

	sleep()
	{
		this.viewport.actors.remove(this);

		console.log(this);
	}
}
