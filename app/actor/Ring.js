import { PointActor } from './PointActor';

export class Ring extends PointActor
{
	template = `<div class  = "point-actor [[type]]">
		<div class = "sprite" cv-ref = "sprite"></div>
	</div>`;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-ring';

		this.args.width  = 32;
		this.args.height = 32;
		this.args.static = true;
		this.args.gone   = false;
		this.args.float  = -1;
		this.args.gravity = 0.24 * 2;
	}

	update()
	{
		if(!this.viewport)
		{
			return;
		}

		if((this.viewport.args.frameId) % 4)
		{
			this.noClip = true;
		}
		else if(!this.args.decoration && !this.attract)
		{
			this.noClip = false;
		}

		if(this.args.decoration)
		{
			this.args.type = 'actor-item actor-ring decoration';
		}

		if(!this.args.falling)
		{
			// this.args.y += -6;
			this.args.ySpeed = (-this.ySpeedLast *0.5);
			this.args.xSpeed = (this.xSpeedLast *0.65);
			this.args.falling = true;
		}

		super.update()
	}

	callCollideHandler(other)
	{
		if(other instanceof Ring)
		{
			return;
		}

		return super.callCollideHandler(other);
	}

	collideA(other)
	{
		if(this.public.gone || this.args.ignore)
		{
			return false;
		}

		super.collideA(other);

		if(other.public.owner)
		{
			other = other.args.owner;
		}

		if(other.occupant)
		{
			other = other.occupant;
		}

		if(!other.controllable && !other.occupant && !other.public.owner)
		{
			return false;
		}

		if(other.controllable)
		{
			other.args.rings += 1;

			// const losable = new this.constructor;

			// losable.viewport = this.viewport;

			// losable.render(other.ringDoc);
		}

		this.args.gone = true;

		this.viewport.auras.delete(this);

		this.args.xSpeed = 0;
		this.args.ySpeed = 0;
		this.args.static = true;
		this.args.float  = -1;

		this.args.type = 'actor-item actor-ring collected';

		if(this.viewport.args.audio)
		{
			if(!this.sample)
			{
				this.sample = new Audio('/Sonic/ring-collect.wav');
				this.sample.volume = 0.15 + (Math.random() * -0.05);
			}

			this.sample.play();
		}

		this.viewport.onFrameOut(5, () => {
			this.args.type = 'actor-item actor-ring collected gone'
		});

		const x = this.x;
		const y = this.y;

		const viewport = this.viewport;

		this.viewport.onFrameOut(1200, () => {
			this.restore = true;
		});

		if(other.collect)
		{
			if(typeof ga === 'function')
			{
				ga('send', 'event', {
					eventCategory: 'ring',
					eventAction: 'collected',
					eventLabel: `${this.viewport.args.actName}::${this.args.id}`
				});
			}

			this.onNextFrame(()=> {
				other.collect(this);
			});
		}

		this.args.xSpeed = 0;
		this.args.ySpeed = 0;
	}

	wakeUp()
	{
		if(this.restore)
		{
			this.args.x = this.def.get('x');
			this.args.y = this.def.get('y');
			// this.args.float = -1;

			this.args.gone = this.restore = false;
			this.args.type = 'actor-item actor-ring'
		}
	}

	get solid() { return false; }
}
