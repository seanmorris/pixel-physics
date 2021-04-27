import { MarbleBlock } from './MarbleBlock';
import { LavaRegion } from '../region/LavaRegion';

export class Block3d extends MarbleBlock
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-block-3d';
	}
}
