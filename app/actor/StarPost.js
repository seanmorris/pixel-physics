import { PointActor } from './PointActor';

export class StarPost extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-star-post';

		this.args.width  = 16;
		this.args.height = 48;
		this.args.active = false;
	}

	collideA(other)
	{
		super.collideA(other);

		// if(this.args.gone)
		// {
		// 	return;
		// }

		// this.args.type = 'actor-item actor-ring collected';

		// if(!this.args.gone)
		// {
		// 	this.onTimeout(240, () => {
		// 		this.args.type = 'actor-item actor-ring collected gone'
		// 	});

		// 	this.onTimeout(480, () => {
		// 		this.viewport.actors.remove( this );
		// 	});
		// }

		// this.args.gone = true;
	}

	get solid() { return false; }
	get isEffect() { return false; }
}
