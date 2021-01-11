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

	collideA(other)
	{
		const back = !!Number(this.args.back);

		if(other.args.gSpeed >= 0)
		{
			other.args.layer = back ? 1 : 2;
		}
		else if(other.args.gSpeed < 0)
		{
			other.args.layer = back ? 2 : 1;
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
