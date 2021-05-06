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

			this.args.pushed = Math.sign(other.public.gSpeed) || this.args.pushed;

			const tileMap = this.viewport.tileMap;

			const moveBy  = (type === 1 && 1) || (type === 3 && -1);

			const scan = this.scanBottomEdge(moveBy);

			const blockers = tileMap.getSolid(this.x + (this.args.width/2) * moveBy, this.y)

			if(blockers)
			{
				return true;
			}

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

				if(!nextPosition[1] || nextPosition[2])
				{
					this.args.x += nextPosition[0] || moveBy;

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

