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
	}

	// onAttach()
	// {
	// 	this.autoAttr.get(this.box)['data-upward'] = 'upward';

	// 	if(!this.viewport || !this.args.switch)
	// 	{
	// 		return;
	// 	}

	// 	this.switch = this.viewport.actorsById[ this.args.switch ];

	// 	if(!this.switch)
	// 	{
	// 		return;
	// 	}

	// 	this.switch.args.bindTo('active', v => {
	// 		if(v && v > 0 && !this.args.active)
	// 		{
	// 			this.args.active = true;
	// 			this.onNextFrame(()=>{
	// 				this.args.toWidth = this.args.openWidth;
	// 				// this.args.y -= this.args.openOffset;
	// 			});
	// 		}
	// 	});
	// }

	// update()
	// {
	// 	super.update();

	// 	if(this.args.toWidth !== this.args.width)
	// 	{
	// 		const diff = this.args.toWidth - this.args.width;
	// 		const increment = Math.sign(diff) * 32;

	// 		if(diff <= increment)
	// 		{
	// 			this.args.width = this.args.toWidth;
	// 			// this.args.y = this.args.yOriginal + this.args.toWidth;
	// 		}
	// 		else
	// 		{
	// 			this.args.width += increment;
	// 			// this.args.x += increment;
	// 		}

	// 	}
	// }

	// activate()
	// {
	// 	this.args.active = 1;
	// }

	get solid() { return false; }
	get isEffect() { return true; }
	get isGhost() { return true; }
}
