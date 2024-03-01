import { PointActor } from './PointActor';

import { Platformer } from '../behavior/Platformer';

export class MarbleBlock extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-block-marble';

		this.args.width  = 32;
		this.args.height = 32;

		this.args.spriteSheet = this.args.spriteSheet || '/Sonic/marble-zone-block.png';
	}

	collideA(other, type)
	{
		super.collideA(other, type);

		if(other.isEffect)
		{
			return false;
		}

		if(!this.isPushable)
		{
			return true;
		}

		const otherMag = Math.ceil(Math.abs(other.args.gSpeed || other.args.xSpeed));
		const otherDir = Math.sign(other.args.gSpeed || other.args.xSpeed);

		let otherSpeed = otherMag * otherDir;

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

			this.args.pushed = Math.sign(other.args.gSpeed);

			if(this.args.pushed < 0 && this.getMapSolidAt(this.x - Math.ceil(this.args.width/2)+-1, this.y + -4))
			{
				return true;
			}

			if(this.args.pushed > 0 && this.getMapSolidAt(this.x + Math.ceil(this.args.width/2)+1, this.y + -4))
			{
				return true;
			}

			const tileMap  = this.viewport.tileMap;
			const moveBy   = ((type === 1 && 1) || (type === 3 && -1));
			const blockers = tileMap.getSolid(this.x + Math.ceil(this.args.width/2) * moveBy, this.y + -4);

			if(blockers)
			{
				return true;
			}

			const radius = this.args.width / 2;

			if(!this.args.falling)
			{
				const nextCenter = this.bMap('findNextStep', moveBy).get(Platformer);
				// const nextWall   = this.bMap('findNextStep', moveBy + (radius * Math.sign(moveBy))).get(Platformer);

				if(nextCenter[2])
				{
					// this.args.xSpeed = moveBy;

					const scan = this.scanBottomEdge(moveBy);

					if(scan && scan <= (this.args.width + (this.args.width % 2)) * 0.5)
					{
						this.args.xSpeed = Math.sign(moveBy);
						this.args.x += scan * Math.sign(moveBy);
					}

					// this.args.falling = true;
				}
				else if(!nextCenter[3])
				{
					const otherRadius = other.args.width / 2;
					const myRadius = this.args.width / 2;

					if(Math.trunc(Math.abs(this.x - other.x)) <= (1 + otherRadius + myRadius))
					{
						// this.args.x = other.args.x + (moveBy * (Math.abs(other.args.gSpeed) + myRadius + otherRadius));
						this.args.x += nextCenter[0];
						this.args.y -= nextCenter[1];

						const direction = Math.sign(other.args.gSpeed);

						if(Math.sign(this.x - other.x) === direction)
						{
							other.args.pushing = direction;
							// other.args.rolling = false;
						}

						const weightRatio = this.args.weight / other.args.weight;

						other.args.gSpeed -= weightRatio * 0.005 * Math.sign(other.args.gSpeed);
					}

					return false;
				}

				return true;
			}
		}

		if(other.args.ySpeed < 0)
		{
			return false;
		}

		return true;
	}

	onAttach()
	{
		this.args.spriteSheet = this.args.spriteSheet || '/Sonic/marble-zone-block.png';

		if(this.viewport)
		{
			this.setTile();
		}
	}

	get isPushable() { return true; }
	get canStick()   { return false; }
	get solid()      { return true; }
	get rotateLock() { return true; }
}

