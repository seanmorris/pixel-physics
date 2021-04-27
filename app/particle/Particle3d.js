import { Tag } from 'curvature/base/Tag';

export class Particle3d extends Tag
{
	constructor()
	{
		super('<div class = "particle-3d">');

		const front  = new Tag('<div class = "front-3d">');
		const back   = new Tag('<div class = "back-3d">');
		const left   = new Tag('<div class = "right-3d">');
		const right  = new Tag('<div class = "left-3d">');
		const top    = new Tag('<div class = "top-3d">');
		const bottom = new Tag('<div class = "bottom-3d">');

		this.append(back.node);
		this.append(left.node);
		this.append(right.node);
		this.append(front.node);
		this.append(top.node);
		this.append(bottom.node);
	}
}
