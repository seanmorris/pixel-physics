import { MarbleBlock } from './MarbleBlock';

export class CompanionBlock extends MarbleBlock
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-marble-companion-block';
	}
}

