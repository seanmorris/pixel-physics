import { Tag } from 'curvature/base/Tag';

export const Constrainable = {

	onAttached: function() {
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.chain = new Tag('<div class = "chain">');

		this.sprite.appendChild(this.chain.node);

		if(!this.args._tiedTo)
		{
			const tiedTo = this.viewport.actorsById[ this.args.tiedTo ];

			this.args._tiedTo = tiedTo;

			if(tiedTo && !tiedTo.hanging.has(this.constructor))
			{
				tiedTo.hanging.set(this.constructor, new Set);
				const hangList = tiedTo.hanging.get(this.constructor);
				hangList.add(this);
				this.onRemove(() => hangList.delete(this));
			}

		}
	}

	, findNextStep: function() {
		return false;
	}

	, setPos: function()
	{
		const tiedTo = this.args._tiedTo;

		if(!tiedTo)
		{
			return false;
		}

		if(!tiedTo.args.falling)
		{
			this.args.groundAngle = -1.57;
			return false;
		}

		this.args.ropeLength = this.args.ropeLength || tiedTo.args.ropeLength;

		this.args.falling = true;

		const xDist = tiedTo.x - this.x;
		const yDist = tiedTo.y - this.y;

		const angle = Math.atan2(yDist, xDist);
		const dist  = Math.sqrt(yDist**2 + xDist**2);

		const maxDist = this.args.ropeLength || 64;

		if(this.chain)
		{
			this.chain.style({'--distance':Math.min(dist, maxDist)});
		}

		this.args.groundAngle = -(angle + Math.PI / 2);

		const gravityAngle = angle + Math.PI;

		if(dist >= maxDist)
		{
			const xNext = tiedTo.x - Math.cos(angle) * maxDist;// - tiedTo.args.xSpeed;
			const yNext = tiedTo.y - Math.sin(angle) * maxDist;// - tiedTo.args.ySpeed;

			this.args.xSpeed -= Math.cos(gravityAngle);
			this.args.ySpeed -= Math.sin(gravityAngle);

			this.args.x = xNext - (tiedTo.args.xSpeed / 5);
			this.args.y = yNext;

			if(this.viewport)
			{
				this.viewport.setColCell(this);
			}

			if(this.x === tiedTo.x && !tiedTo.args.xSpeed)
			{
				this.args.ySpeed = 0;
			}
		}
	}

};
