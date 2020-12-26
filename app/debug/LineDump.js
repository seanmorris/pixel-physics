import { View } from 'curvature/base/View';

export class LineDump extends View
{
	template = `<div class = "line-dump" style = "--x:[[x]];--y:[[y]];--length:[[len]];--angle:[[angle]]">
		<div class = "line" style = "border-color:[[color]]"></div>
	</div>`;
	constructor(...args)
	{
		super(...args);

		this.args.x = this.args.x || 0;
		this.args.y = this.args.y || 0;
	}
}
