import { PointActor } from './PointActor';

export class Switch extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-switch';

		this.args.width  = 32;
		this.args.height = 10;

		// this.args.float  = -1;

		this.removeTimer = null;

		this.args.active = false;

		this.activator = null;

		this.args.bindTo('active', v => {
			this.box && this.box.setAttribute('data-active', v ? 'true' : 'false');
		});

		this.ignore = 0;
	}

	update()
	{
		super.update();

		if(this.ignore > 0)
		{
			this.ignore--;

			return;
		}

		if(!this.activator || this.activator.args.standingOn !== this)
		{
			this.args.active = false;
			this.activator   = null;
		}
	}

	onAttached()
	{
		this.box = this.findTag('div');

		this.sample = new Audio('/Sonic/switch-activated.wav');
	}

	collideA(other, type)
	{
		if(other.public.ySpeed < 0)
		{
			if(other.public.ySpeed === 0 && other.y > this.y )
			{
				return true;
			}

			return false;
		}

		if(this.public.active && other.y < this.y)
		{
			return true;
		}

		other.onRemove(()=>{
			if(this.activator === other)
			{
				this.activator = null;
			}
		});

		if(other.isVehicle)
		{
			if(!this.public.active)
			{
				this.activate();
			}

			this.activator = other;

			this.ignore = 16;

			const top = this.y - this.public.height;

			if(other.y > top && !other.public.falling)
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

		if(other.y < this.y)
		{
			if(!this.public.active)
			{
				this.activate();
			}

			this.ignore = 8;

			this.args.active = true;

			this.activator = other;

			return true;
		}

		return false;
	}

	activate()
	{
		this.beep();

		if(this.args.destroyLayer)
		{
			const layerId = this.args.destroyLayer;
			const layer   = this.viewport.args.layers[ layerId ];

			layer.args.destroyed = true;

		}

		this.args.active = true;
	}

	beep()
	{
		if(this.viewport.args.audio && this.sample)
		{
			this.sample.play();
		}
	}

	get solid() { return this.public.active; }
}
