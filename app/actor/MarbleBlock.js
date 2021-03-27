import { PointActor } from './PointActor';

export class MarbleBlock extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-block-marble';

		this.args.width  = 32;
		this.args.height = 32;
	}

	update()
	{
		super.update();

		const scan = this.scanBottomEdge();

		if(scan === 0)
		{
			this.args.falling = true;
		}
	}

	collideA(other, type)
	{
		super.collideA(other, type);

		const otherSpeed = other.args.gSpeed || other.args.xSpeed;

		if(Math.abs(other.public.ySpeed) > Math.abs(other.public.xSpeed))
		{
			return true;
		}

		if(type === 1 && otherSpeed <= 0)
		{
			return false;
		}

		if(type === 3 && otherSpeed >= 0)
		{
			return false;
		}

		if(type === 1 || type === 3)
		{
			if(!otherSpeed)
			{
				return true;
			}

			const tileMap = this.viewport.tileMap;
			const moveBy  = (type === 1 && 1) || (type === 3 && -1);

			const blockers = tileMap.getSolid(this.x + (this.args.width/2) * moveBy, this.y)

			if(blockers)
			{
				return true;
			}

			const scan = this.scanBottomEdge(moveBy);

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
				const nextPosition = this.findNextStep(moveBy);

				if(!nextPosition[1])
				{
					const realMoveBy = nextPosition[0] || moveBy;

					this.args.x += realMoveBy;

					return scan === 0;
				}

				return true;
			}
		}

		return true;
	}

	get canStick() { return false; }
	get solid() { return true; }
	get rotateLock() { return true; }
	get isPushable() { return true; }
}

