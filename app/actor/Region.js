import { PointActor } from './PointActor';

export class Region extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-water';

		this.args.width  = this.args.width  || 32;
		this.args.height = this.args.height || 32;

		this.args.gravity = 0.1;
		this.args.drag    = 0.2;
	}

	update()
	{
		if(!this.originalHeight)
		{
			this.originalHeight = this.args.height;
		}

		const min =  32 * 4.5;

		this.args.height = Math.floor(Math.abs((this.originalHeight - min) * Math.sin(Date.now() / 60000)) + min);

	}

	get solid() { return false; }
	get isEffect() { return true; }
}
