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

			this.args.pushed = Math.sign(other.args.gSpeed) || this.args.pushed;

			if(this.args.pushed < 0 && this.getMapSolidAt(this.x - Math.ceil(this.args.width/2)+-1, this.y + -1))
			{
				return true;
			}


			if(this.args.pushed > 0 && this.getMapSolidAt(this.x + Math.ceil(this.args.width/2)+1, this.y + -1))
			{
				return true;
			}

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

				other.args.ignore = other.args.ignore || 1;
				other.args.gSpeed = 0;
			}
			else if(moveBy < 0 && scan === 0)
			{
				this.args.falling = true;

				other.args.ignore = other.args.ignore || 1;
				other.args.gSpeed = 0;
			}
			else if(!this.args.falling || scan > 0)
			{
				// const nextCenter = this.findNextStep(moveBy);
				// const nextWall   = this.findNextStep(moveBy + (radius * Math.sign(moveBy)));

				const nextCenter = this.bMap('findNextStep', moveBy).get(Platformer);
				const nextWall   = this.bMap('findNextStep', moveBy + (radius * Math.sign(moveBy))).get(Platformer);

				if((!nextCenter[1] || nextCenter[2]) && !nextWall[3])
				{
					const otherRadius = other.args.width / 2;
					const myRadius = this.args.width / 2;

					if(Math.abs(this.x - other.x) <= otherRadius + myRadius)
					{
						this.args.x = other.args.x + (moveBy * (myRadius + otherRadius));

						const direction = Math.sign(other.args.gSpeed);

						if(Math.sign(this.x - other.x) === direction)
						{
							other.args.pushing = direction;
							// other.args.rolling = false;
						}

						const weightRatio = this.args.weight / other.args.weight;

						other.args.gSpeed -= weightRatio * 0.005 * Math.sign(other.args.gSpeed);
					}

					return scan === 0;
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

		this.setTile();
	}

	get isPushable() { return true; }
	get canStick()   { return false; }
	get solid()      { return true; }
	get rotateLock() { return true; }
}

