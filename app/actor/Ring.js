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
		this.args.gone   = false;
		this.args.float  = -1;
		this.sample = new Audio('/Sonic/ring-collect.wav');
		this.sample.volume = 0.15 + (Math.random() * -0.05);
	}

	collideA(other)
	{
		if(this.public.gone)
		{
			return;
		}

		super.collideA(other);

		if(other.args.owner)
		{
			other.args.owner.args.rings += 1;
		}
		else if(other.occupant)
		{
			other.occupant.args.rings += 1;
		}
		else
		{
			other.args.rings += 1;
		}

		if(!other.controllable && !other.occupant && !other.args.owner)
		{
			return;
		}

		this.args.gone = true;

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

		this.viewport.onFrameOut(2200, () => {
			this.restore = true;
		});

		if(other.collect)
		{
			this.onNextFrame(()=> {
				other.collect(this);
			});
		}

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
			this.args.gone = this.restore = false;
			this.args.type = 'actor-item actor-ring'
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
