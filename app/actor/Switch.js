import { PointActor } from './PointActor';

export class Switch extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-switch';

		this.args.width  = 32;
		this.args.height = 10;

		this.args.float  = -1;

		this.removeTimer = null;

		this.args.active = false;

		this.activator = null;

		this.args.bindTo('active', v => {
			this.box && this.box.setAttribute('data-active', v ? 'true' : 'false');
		});
	}

	update()
	{
		if(!this.activator || this.activator.standingOn !== this)
		{
			this.args.active = false;
			this.activator   = null;
		}
	}

	onAttached()
	{
		this.box = this.findTag('div');
	}

	collideA(other, type)
	{
		other.onRemove(()=>{
			if(this.activator === other)
			{
				this.activator = null;
			}
		});

		if(other.isVehicle)
		{
			this.args.active = true;

			this.activator = other;

			const top = this.y - this.public.height;

			if(other.args.y > top && !other.public.falling)
			{
				other.args.y = top;
			}

			if(type === 1 || type === 3)
			{
				return false;
			}

			if(type === 0 || other.public.ySpeed < 0)
			{
				return false;
			}

			return true;
		}

		if([0,-1].includes(type) && other.args.ySpeed >= 0)
		{
			this.args.active = true;

			this.activator = other;

			return true;
		}
	}

	get solid() { return true; }
}
