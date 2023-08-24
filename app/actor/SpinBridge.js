import { Block } from "./Block";

export class SpinBridge extends Block
{
	segments = new Set;

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.offset = this.args.offset || 0;
		this.args.speed  = this.args.speed  || 1;
	}

	initialize()
	{
		super.initialize();

		if(!this.getMapSolidAt(this.args.x + this.args.width, this.args.y))
		{
			const firstSegment = this.args.prevSegment
				? this.args.prevSegment.args.firstSegment
				: this;

			if(!this.args.segmentIndex)
			{
				this.args.segmentIndex = 0;
				this.args.firstSegment = this;
				this.segments.add(firstSegment);
			}

			if(this.args.segmentIndex >= 7)
			{
				return;
			}

			const next = new this.constructor({
				platform: this.args.platform,
				segmentIndex: this.args.segmentIndex + 1,
				prevSegment: this,
				firstSegment,
				float: -1,
				width:  this.args.width,
				height: this.args.height,
				tileId: this.args.tileId,
				speed:  this.args.speed,
				offset: this.args.offset,
				x: this.args.x + this.args.width,
				y: this.args.y + 4,
			});

			firstSegment.segments.add(next);

			this.args.nextSegment = next;

			this.viewport.spawn.add({object: next});

			firstSegment.args.platform = true;
		}
	}

	updateEnd()
	{
		const age = this.viewport.args.frameId * this.args.speed + this.args.offset;
		const originX = this.args.firstSegment.args.x;
		const originY = this.args.firstSegment.args.y;
		const dist = this.args.segmentIndex * 16;

		this.args.x = originX + Math.cos((age / 120) * Math.PI) * dist;
		this.args.y = originY + Math.sin((age / 120) * Math.PI) * dist;

		super.updateEnd();
	}

	collideA(other,type)
	{
		if(other instanceof SpinBridge)
		{
			return false;
		}

		return super.collideA(other,type);
	}
}
