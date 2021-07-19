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

		this.args.falling = true;

		const xDist = tiedTo.x - this.x;
		const yDist = tiedTo.y - this.y;

		const angle = Math.atan2(yDist, xDist);
		const dist  = Math.sqrt(yDist**2 + xDist**2);

		const maxDist = this.args.ropeLength || 64;

		this.chain.style({'--distance':Math.min(dist, maxDist)});

		this.args.groundAngle = -(angle + Math.PI / 2);

		const gravityAngle = angle + Math.PI;

		if(dist >= maxDist)
		{
			if(this.hooked && this.hooked.xAxis)
			{
				if(Math.sign(this.args.xSpeed) || Math.sign(this.args.xSpeed) === Math.sign(this.hooked.xAxis))
				{
					this.args.xSpeed += this.hooked.xAxis * 0.5;
				}
			}

			const xNext = tiedTo.x - Math.cos(angle) * maxDist - tiedTo.args.xSpeed;
			const yNext = tiedTo.y - Math.sin(angle) * maxDist - tiedTo.args.ySpeed;

			this.args.xSpeed -= Math.cos(gravityAngle);
			this.args.ySpeed -= Math.sin(gravityAngle);

			this.args.x = xNext;
			this.args.y = yNext;

			this.viewport.setColCell(this);

			if(this.x === tiedTo.x && !tiedTo.args.xSpeed)
			{
				this.args.ySpeed = 0;
			}
		}
	}

};
