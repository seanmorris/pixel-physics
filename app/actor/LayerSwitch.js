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
	}

	collideA(other, type)
	{
		let speed = other.public.gSpeed || other.public.direction || other.xAxis;
		let back  = !!Number(this.public.back);
		let roll  = !!Number(this.public.roll);

		const invert = (other.args.mode === 2 || other.args.mode === 3) ? -1 : 1;

		const radius = this.args.width / 2;
		const otherRadius = 0; //other.args.width / 2;

		if(other.x < this.x + -radius + otherRadius || other.x > this.x + radius + -otherRadius)
		{
			return;
		}

		if(other.y < this.y + -this.public.height || other.y > this.y)
		{
			return;
		}

		if(roll && (!other.public.rolling || other.public.height > 28))
		{
			other.args.layer = toLayer === 1 ? 2 : 1;
			return false;
		}

		if(back && other.public.falling)
		{
			speed = other.public.xSpeed || other.public.direction;
			back  = !back;
		}

		let toLayer = other.public.layer;

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
