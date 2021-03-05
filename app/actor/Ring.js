import { PointActor } from './PointActor';

export class Ring extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-ring';

		this.args.width  = 32;
		this.args.height = 32;
		this.args.float  = -1;
		this.args.gone   = false;
	}

	update()
	{
		super.update();

		if(this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/ring-collect.wav');
			this.sample.volume = 0.15 + (Math.random() * -0.05);
		}
	}

	collideA(other)
	{
		if(this.public.gone)
		{
			return;
		}

		super.collideA(other);

		this.args.gone = true;

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

		if(!other.controllable && !other.occupant && !other.owner)
		{
			return;
		}

		this.args.type = 'actor-item actor-ring collected';

		if(this.viewport.args.audio && this.sample)
		{
			this.sample.play();
		}

		this.onTimeout(60, () => {
			this.args.type = 'actor-item actor-ring collected gone'
		});

		const x = this.x;
		const y = this.y;

		const viewport = this.viewport;

		this.onTimeout(3500, () => {
			this.args.gone = false;
			this.args.type = 'actor-item actor-ring'
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

	get solid() { return false; }
	get isEffect() { return true; }
}
