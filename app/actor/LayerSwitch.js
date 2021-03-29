import { PointActor } from './PointActor';

export class LayerSwitch extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		return obj;
	}

	onAttach(event)
	{
		event.preventDefault(event);
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-layer-switch';

		this.args.width  = 32;
		this.args.height = 32;

		this.args.float  = -1;
	}

	collideA(other, type)
	{
		let speed = other.args.gSpeed;
		let back  = !!Number(this.public.back);
		let roll  = !!Number(this.public.roll);

		if(roll && (!other.public.rolling || other.public.height > 32))
		{
			other.args.layer = toLayer === 1 ? 2 : 1;
			return false;
		}

		if(back && other.public.falling)
		{
			speed = other.args.xSpeed;
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
			this.onNextFrame(()=>{
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
