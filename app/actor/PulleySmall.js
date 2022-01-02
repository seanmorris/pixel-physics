import { Pulley } from './Pulley';

export class PulleySmall extends Pulley
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 32;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-pulley-small';

		this.args.convey = 0;

		this.args.float = -1;
		this.noClip = true;
	}
}
