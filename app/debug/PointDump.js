import { View } from 'curvature/base/View';

export class PointDump extends View
{
	template = `<div class = "point-dump" style = "--x:[[x]];--y:[[y]];">
		<div class = "point" style = "--color:[[color]]"></div>
	</div>`;
	constructor(...args)
	{
		super(...args);

		this.args.x = this.args.x || 0;
		this.args.y = this.args.y || 0;
	}
}
