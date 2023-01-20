import { View } from 'curvature/base/View';

export class Plot extends View
{
	template = `<svg style = "--x:[[x]];--y:[[y]]" cv-each = "points:point" class = "plot">
		<circle cx="[[point.x]]" cy="[[point.y]]" r="2" class="[[point.color]]" />
	</svg>`;

	constructor(args, parent)
	{
		super(args, parent);

		this.args.points = [];
		this.points = new Set;
		this.count = 0;
		this.max = 2048;

		// this.addPoint('50%', '50%', 'red');
	}

	clearPoints()
	{
		for(const point of this.args.points)
		{
			Object.assign(point, {x:0, y:0, color:'hidden'});
		}

		this.count = 0;
	}

	addPoint(x, y, color)
	{
		color += ` point-${this.count}`;

		const index = this.count++ % this.max;

		if(this.args.points.length >= this.max)
		{
			Object.assign(this.args.points[index], {x, y, color});
			return;
		}

		this.args.points.push({x, y, color});
	}
}
