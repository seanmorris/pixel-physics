import { PointActor } from './PointActor';

export class Door extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.clear();

		this.args.type = 'actor-item actor-door';

		this.args.width  = 32;
		this.args.height = 64;

		this.args.opened  = false;
		this.args.opening = false;
	}

	onRendered()
	{
		super.onRendered(event);

		this.setAutoAttr('opening', 'data-opening');
		this.setAutoAttr('opened',  'data-opened');
	}

	open(other)
	{
		if(!other.controllable)
		{
			return;
		}

		if(this.others.waitFor && this.others.waitFor.args.opened)
		{
			this.args.opening = this.args.opened = false;
			return;
		}

		this.args.opening = true;
		this.viewport.onFrameOut(10, () => this.args.opened = true);

		this.viewport.onFrameOut(50, () => this.args.opening = false);
		this.viewport.onFrameOut(55, () => this.args.opened = false);
	}

	collideA(other, type)
	{
		if(this.args.opening)
		{
			return !this.args.opened;
		}

		if(!this.args.opened)
		{
			this.viewport.onFrameOut(20, () => this.open(other));
		}

		return !this.args.opened;
	}

	sleep()
	{
		if(!this.viewport)
		{
			return;
		}

		this.args.opening = this.args.opened = false;
	}

	get solid() { return !this.args.opened; }
	get rotateLock() { return true; }
}
