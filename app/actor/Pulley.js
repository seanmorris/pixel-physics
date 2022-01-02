import { PointActor } from './PointActor';
import { Ring } from './Ring';

export class Pulley extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 64;
		this.args.height = 64;
		this.args.type   = 'actor-item actor-pulley';

		this.args.convey = 0;
		this.args.conveyed = 0;

		this.args.float = -1;
		this.noClip = true;
	}

	update()
	{
		if(this.match)
		{
			this.args.convey = -this.match.args.convey;
		}
		else
		{
			this.match = this.viewport.actorsById[ this.args.match ];
		}

		this.box && this.box.style({'--convey':Math.abs(this.args.convey)});
		this.box && this.box.style({'--conveyDir':Math.sign(this.args.convey)});

		this.args.conveyed += this.match.args.convey;

		this.box && this.box.style({'--conveyed': this.args.conveyed});

		// if(Math.abs(this.args.convey) > 10
		// 	&& Math.sign(this.args.convey) === this.args.reward
		// 	&& this.viewport.args.frameId % 60 === 0
		// ){
		// 	const ring = new Ring({
		// 		static:   false
		// 		, float:  10
		// 		, ySpeed: 1
		// 		, x:this.x
		// 		, y:this.y - 192,

		// 	});

		// 	ring.scattered = true;
		// 	ring.noClip = false;

		// 	this.viewport.spawn.add({object: ring});

		// 	this.viewport.onFrameOut(100, () => {
		// 		this.viewport.actors.remove(ring);
		// 	});
		// }

		// super.update();
	}

	get isEffect() { return true; }
}
