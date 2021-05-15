import { PointActor } from './PointActor';

export class Ring extends PointActor
{
	float = -1;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-ring';

		this.args.width  = 32;
		this.args.height = 32;
		this.args.static = true;
		this.args.gone   = false;
		this.args.float  = -1;
		this.sample = new Audio('/Sonic/ring-collect.wav');
		this.sample.volume = 0.15 + (Math.random() * -0.05);
	}

	collideA(other)
	{
		if(this.public.gone)
		{
			return false;
		}

		if(!other.controllable && !other.occupant && !other.public.owner)
		{
			return false;
		}

		super.collideA(other);

		if(other.public.owner)
		{
			other.args.owner.args.rings += 1;
		}
		else if(other.occupant)
		{
			other.occupant.args.rings += 1;
		}
		else if(other.controllable)
		{
			other.args.rings += 1;
		}

		this.args.gone = true;

		this.viewport.auras.delete(this);

		this.args.type = 'actor-item actor-ring collected';

		if(this.viewport.args.audio && this.sample)
		{
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
			this.onNextFrame(()=> {
				other.collect(this);
			});
		}

		this.args.xSpeed = 0;
		this.args.ySpeed = 0;

		// this.onTimeout(120, () => {
		// 	viewport.actors.remove( this );
		// 	this.remove();
		// });

		// viewport.spawn.add({
		// 	time: Date.now() + 3500
		// 	, frame:  this.viewport.args.frameId + 210
		// 	, object: new Ring({x,y})
		// });



		// this.args.gone = true;
	}

	wakeUp()
	{
		if(this.restore)
		{
			this.args.x = this.def.get('x');
			this.args.y = this.def.get('y');
			this.args.float = -1;

			this.args.gone = this.restore = false;
			this.args.type = 'actor-item actor-ring'
		}
	}

	get solid() { return false; }
}
