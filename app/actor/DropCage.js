import { PointActor } from './PointActor';

export class DropCage extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 48;
		this.args.height = 40;
		this.args.type   = 'actor-item actor-drop-cage';
		this.args.float  = -1;
	}

	collideA(other, type)
	{
		if(type === -1 || type % 2 === 0)
		{
			if(other.args.y >= this.y - 16
				&& other.args.y < this.y - 6
			){
				other.args.xSpeed = 0;
				other.args.x = this.x;

				other.args.ySpeed = 0;
				other.args.float  = -1;
				other.args.ignore = -1;
				other.args.y      = this.y - 6;

				this.dropDelay(other).then(() => {
					other.args.float  = 0;
					other.args.ignore = 5;
				});
			}

			return false;
		}

		return true;
	}

	dropDelay(other)
	{
		let waitFor = false;

		if(this.args.waitFor)
		{
			waitFor = this.viewport.actorsById[this.args.waitFor];
		}

		if(!waitFor)
		{
			return new Promise(accept => this.viewport.onFrameOut(30, () => accept()));
		}

		return waitFor.dropDelay(other);
	}

	get solid() { return true; }
}
