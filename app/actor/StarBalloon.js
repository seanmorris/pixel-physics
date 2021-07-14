import { Balloon } from './Balloon';

export class StarBalloon extends Balloon
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-balloon actor-star-balloon';
	}
}
