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
		this.args.static = true;

		this.args.fromLayer = this.args.fromLayer ?? 1;
		this.args.toLayer   = this.args.toLayer   ?? 2;
	}

	collideA(other, type)
	{
		let speed = other.args.gSpeed || other.args.xSpeed ||other.args.direction || other.xAxis;
		let back  = !!Number(this.args.back);
		let roll  = !!Number(this.args.roll);

		const invert = (other.args.mode === 2 || other.args.mode === 3) ? -1 : 1;

		const radius = this.args.width / 2;
		const otherRadius = 0; //other.args.width / 2;

		const thisX = this.args.x;
		const thisY = this.args.y;

		const otherX = other.args.x;
		const otherY = other.args.y;

		if(otherX < thisX + -radius + otherRadius || otherX > thisX + radius + -otherRadius)
		{
			return;
		}

		if(otherY < thisY + -this.args.height || other.y > thisY)
		{
			return;
		}

		if(this.args.allow || this.args.disallow)
		{
			if(this.args.allow)
			{
				other.doorMap.set(Number(this.args.allow), false);
			}

			if(this.args.disallow)
			{
				other.doorMap.set(Number(this.args.disallow), true);
			}

			return;
		}

		if(roll && (!other.args.rolling || other.args.height > 28))
		{
			other.args.layer = toLayer === this.args.fromLayer ? this.args.toLayer : this.args.fromLayer;
			return false;
		}

		if(back && other.args.falling)
		{
			speed = other.args.xSpeed || other.args.direction;
			back  = !back;
		}

		let toLayer = other.args.layer;
		let fromLayer = this.args.fromLayer;

		if(speed > 0)
		{
			toLayer = back ? this.args.fromLayer : this.args.toLayer;
			fromLayer = back ? this.args.toLayer : this.args.fromLayer;
		}

		if(speed < 0)
		{
			toLayer = back ? this.args.toLayer : this.args.fromLayer;
			fromLayer = back ? this.args.fromLayer : this.args.toLayer;
		}

		if(!this.viewport.tileMap.getSolid(otherX, otherY, toLayer))
		{
			if(!other.args.layer || other.args.layer === fromLayer)
			{
				other.args.layer = toLayer;
			}
		}
		else
		{
			this.viewport.onFrameOut(1,()=>{
				if(!this.viewport.tileMap.getSolid(otherX, otherY, toLayer))
				{
					other.args.layer = toLayer;
				}
			});
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
