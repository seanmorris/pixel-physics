import { PointActor } from './PointActor';

export class WaterJet extends PointActor
{
	float = -1;

	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		obj.args.x      = objDef.x + (objDef.width / 2);

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.width  = this.args.width  || 32;
		this.args.height = this.args.height || 64;
		this.args.type   = 'actor-item actor-water-jet';
		this.args.active = false;
		this.args.static = true;
	}

	wakeUp()
	{
		this.switch = this.viewport.actorsById[ this.args.switch ];
	}

	update()
	{
		super.update();

		if(!this.viewport || !this.args.switch)
		{
			return;
		}

		if(!this.switch)
		{
			return;
		}

		if(this.switch.args.active && !this.args.active)
		{
			this.args.active = true;
			this.onNextFrame(()=>{
				this.args.x += (0.5 * this.args.openWidth) + (-0.5 * this.args.width);
				this.args.width = this.args.openWidth;
			});
		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
