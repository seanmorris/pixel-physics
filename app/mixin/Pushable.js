export const Pushable = {
	collideA: function(other, type) {

		if(type === -1 || other.isEffect)
		{
			return false;
		}

		const otherMag = Math.ceil(Math.abs(other.args.gSpeed || other.args.xSpeed));
		const otherDir = Math.sign(other.args.gSpeed || other.args.xSpeed);

		let otherSpeed = otherMag * otherDir;

		if(Math.abs(other.public.ySpeed) > Math.abs(other.public.xSpeed))
		{
			return true;
		}

		if(!this.args.falling && type === 1 && otherSpeed <= 0)
		{
			return false;
		}

		if(!this.args.falling && type === 3 && otherSpeed >= 0)
		{
			return false;
		}

		const blockTop = this.y - this.args.height;

		if((type === 1 || type === 3) && (other.y >= this.y || other.y > blockTop))
		{
			if(!otherSpeed)
			{
				return true;
			}

			this.args.gSpeed = otherSpeed;

			this.args.pushed = Math.sign(otherSpeed) || this.args.pushed;

			const tileMap = this.viewport.tileMap;

			const moveBy  = ((type === 1 && 1) || (type === 3 && -1));

			const scan = this.scanBottomEdge(moveBy);

			const blockers = tileMap.getSolid(this.x + Math.ceil(this.args.width/2) * moveBy, this.y);

			if(blockers)
			{
				return true;
			}

			const radius = this.args.width / 2;

			if(moveBy > 0 && scan === 0)
			{
				this.args.falling = true;
			}
			else if(moveBy < 0 && scan === 0)
			{
				this.args.falling = true;
			}
			else if(!this.args.falling || scan > 0)
			{
				const nextCenter = this.findNextStep(moveBy);
				const nextWall   = this.findNextStep(moveBy + (radius * Math.sign(moveBy)));

				if((!nextCenter[1] || nextCenter[2]) && !nextWall[3])
				{
					// this.args.x += nextPosition[0] || moveBy;

					const otherRadius = other.args.width;
					const myRadius = this.args.width / 2;

					this.args.x = other.args.x + (moveBy * (myRadius + otherRadius));

					return scan === 0;
				}

				return true;
			}
		}

		return true;
	}
}
