import { PointActor } from './PointActor';

export class Spikes extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.x = obj.originalX = objDef.x + Math.floor(objDef.width / 2);

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-spikes';

		this.args.width  = args.width || 32;
		this.args.height = 32;
	}

	collideA(other, type)
	{
		if(type === 0)
		{
			other.controllable && other.damage();
		}

		return true;
	}

	get solid() {return true;}
	get rotateLock() {return true;}
}
