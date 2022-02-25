import { PointActor } from './PointActor';

export class LayerSwitch extends PointActor
{
	float = -1;

	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		return obj;
	}

	onAttach(event)
	{
		event && event.preventDefault();

		return false;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-layer-switch';

		this.args.width  = 32;
		this.args.height = 32;
		this.static = true;
	}

	collideA(other, type)
	{
		let speed = other.args.gSpeed || other.args.direction || other.xAxis;
		let back  = !!Number(this.args.back);
		let roll  = !!Number(this.args.roll);

		const invert = (other.args.mode === 2 || other.args.mode === 3) ? -1 : 1;

		const radius = this.args.width / 2;
		const otherRadius = 0; //other.args.width / 2;

		if(other.x < this.x + -radius + otherRadius || other.x > this.x + radius + -otherRadius)
		{
			return;
		}

		if(other.y < this.y + -this.args.height || other.y > this.y)
		{
			return;
		}

		if(roll && (!other.args.rolling || other.args.height > 28))
		{
			other.args.layer = toLayer === 1 ? 2 : 1;
			return false;
		}

		if(back && other.args.falling)
		{
			speed = other.args.xSpeed || other.args.direction;
			back  = !back;
		}

		let toLayer = other.args.layer;

		if(speed > 0)
		{
			toLayer = back ? 1 : 2;
		}

		if(speed < 0)
		{
			toLayer = back ? 2 : 1;
		}

		if(!this.viewport.tileMap.getSolid(other.x, other.y, toLayer))
		{
			other.args.layer = toLayer;
		}
		else
		{
			this.viewport.onFrameOut(1,()=>{
				if(!this.viewport.tileMap.getSolid(other.x, other.y, toLayer))
				{
					other.args.layer = toLayer;
				}
			});
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
