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

		if(other.args.falling)
		{
			return true;
		}

		if(type === 1 && other.args.gSpeed <= 0)
		{
			return false;
		}

		if(type === 3 && other.args.gSpeed >= 0)
		{
			return false;
		}

		if(type === 1 || type === 3)
		{
			if(!other.args.gSpeed)
			{
				console.log(others.args.gSpeed);

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
			else if(!this.args.falling)
			{
				const nextPosition = this.findNextStep(moveBy);

				if(!nextPosition[1])
				{
					const realMoveBy = nextPosition[0] || moveBy;

					this.args.x += nextPosition[0] || moveBy;

					return false;
				}

				return true;
			}
		}

		return true;
	}

	scanBottomEdge(direction = 1)
	{
		const tileMap = this.viewport.tileMap;

		return this.castRay(
			this.args.width
			, (direction < 0 ? Math.PI : 0)
			, [-direction * (this.args.width/2), 0]
			, (i,point) => {
				const actors = this.viewport
					.actorsAtPoint(point[0], point[1] + 1)
					.filter(a => a.args !== this.args);

				if(!actors.length && !tileMap.getSolid(point[0], point[1] + 1, this.args.layer))
				{
					return i;
				}
			}
		);
	}

	get canStick() { return false; }
	get solid() { return true; }
	get rotateLock() { return true; }
}

