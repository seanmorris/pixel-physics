import { Tag } from 'curvature/base/Tag';

export const Constrainable = {

	onAttached: function() {
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');
	}

	, wakeUp: function() {

		if(!this.args._tiedTo)
		{
			this.args._tiedTo = this.viewport.actorsById[ this.args.tiedTo ];
		}

		const _tiedTo = this.args._tiedTo;

		if(_tiedTo && !_tiedTo.hanging.has(this.constructor))
		{
			_tiedTo.hanging.set(this.constructor, new Set);
			const hangList = _tiedTo.hanging.get(this.constructor);
			hangList.add(this);

			this.chain = new Tag('<div class = "chain">');
			this.sprite.appendChild(this.chain.node);
			this.onRemove(() => hangList.delete(this));
		}
	}

	, sleep: function() {

		this.viewport.onFrameOut(5, () => {
			this.args.x = this.def.get('x');
			this.args.y = this.def.get('y');

			this.args.xSpeed = 0;
			this.args.ySpeed = 0;

			this.viewport.setColCell(this);
		});
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

		const gravityAngle = angle;

		if(dist > maxDist)
		{
			const overshot = dist - maxDist;

			const xMove = Math.cos(angle) * maxDist;
			const yMove = Math.sin(angle) * maxDist;
			const xNext = tiedTo.x - xMove;
			const yNext = tiedTo.y - yMove;

			this.args.xSpeed += Math.cos(gravityAngle) * overshot;
			this.args.ySpeed += Math.sin(gravityAngle) * overshot;

			this.args.x = xNext;
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

		if(tiedTo.args.ySpeed > 0 && !tiedTo.args.xSpeed && !this.args.xSpeed)
		{
			this.args.x = tiedTo.x;
			this.args.y = tiedTo.y + this.args.ropeLength;
		}
	}
};
