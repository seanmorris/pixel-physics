import { Follower } from './Follower';

export class Flickie extends Follower
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-flickie';

		this.args.palletShift = Math.floor(Math.random() * 8);
	}
}
