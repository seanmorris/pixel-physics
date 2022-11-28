import { Tag } from 'curvature/base/Tag';

export const Constrainable = {

	initialize: function() {
		if(!this.others.tiedTo)
		{
			return;
		}

		const _tiedTo = this.others.tiedTo;

		if(_tiedTo && !_tiedTo.hanging.has(this.constructor))
		{
			_tiedTo.hanging.set(this.constructor, new Set);
			const hangList = _tiedTo.hanging.get(this.constructor);
			hangList.add(this);

			this.chain = new Tag('<div class = "chain">');
			this.sprite.appendChild(this.chain.node);
			this.onRemove(() => hangList.delete(this));
		}

		this.setPos();
	}

	, wakeUp: function() {

	}

	, sleep: function() {

		if(!this.viewport || this.args.stay)
		{
			return;
		}

		if(this.def)
		{
			this.viewport.onFrameOut(5, () => {
				this.args.x = this.def.get('x');
				this.args.y = this.def.get('y');

				this.args.xSpeed = 0;
				this.args.ySpeed = 0;

				this.viewport.setColCell(this);
			});
		}
	}

	// , findNextStep: function() {
	// 	return false;
	// }

	, setPos: function()
	{
		if(!this.others.tiedTo)
		{
			return;
		}

		const tiedTo = this.others.tiedTo;

		if(!tiedTo)
		{
			return false;
		}

		this.args.ropeLength = this.args.ropeLength || tiedTo.args.ropeLength;

		this.args.falling = true;

		const xTarget = tiedTo.args.x;
		const yTarget = tiedTo.args.y;

		const xDist = xTarget - this.args.x;
		const yDist = yTarget - this.args.y;

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
			const xNext = xTarget - xMove;
			const yNext = yTarget - yMove;

			this.args.xSpeed += Math.cos(gravityAngle) * overshot;
			this.args.ySpeed += Math.sin(gravityAngle) * overshot;

			if(this.args.xSpeedMax < Math.abs(this.args.xSpeed))
			{
				this.args.xSpeed = this.args.xSpeedMax * Math.sign(this.args.xSpeed);
			}

			if(this.args.ySpeedMax < Math.abs(this.args.ySpeed))
			{
				this.args.ySpeed = this.args.ySpeedMax * Math.sign(this.args.ySpeed);
			}

			this.args.gSpeed = this.args.xSpeed;

			this.args.x = xNext;
			this.args.y = yNext;

			if(this.viewport)
			{
				this.viewport.setColCell(this);
			}

			if(this.args.x === xTarget && !tiedTo.args.xSpeed)
			{
				this.args.ySpeed = 0;
			}
		}

		if(tiedTo.args.ySpeed > 0 && !tiedTo.args.xSpeed && !this.args.xSpeed)
		{
			this.args.x = xTarget;
			this.args.y = yTarget + this.args.ropeLength;
		}
	}
};
