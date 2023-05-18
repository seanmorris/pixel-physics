// import { MarbleBlock } from './MarbleBlock';
import { Block } from './Block';
import { Tag } from 'curvature/base/Tag';

// import { LavaRegion } from '../region/LavaRegion';

export class Block3d extends Block
{
	constructor(args = {})
	{
		super(args);

		this.args.type = 'actor-item actor-block actor-block-3d';
	}

	onRendered(event)
	{
		super.onRendered(event);

		const front  = new Tag('<div class = "panel-3d front-3d">');
		const back   = new Tag('<div class = "panel-3d back-3d">');
		const left   = new Tag('<div class = "panel-3d right-3d">');
		const right  = new Tag('<div class = "panel-3d left-3d">');
		const top    = new Tag('<div class = "panel-3d top-3d">');
		const bottom = new Tag('<div class = "panel-3d bottom-3d">');

		this.box.append(back.node);
		this.box.append(left.node);
		this.box.append(right.node);
		this.box.append(front.node);
		this.box.append(top.node);
		this.box.append(bottom.node);
	}
}
