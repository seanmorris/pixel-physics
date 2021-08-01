import { PointActor } from './PointActor';

export class WaterFall extends PointActor
{
	float = -1;

	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width    = objDef.width;
		obj.args.height   = objDef.height;
		obj.args.toHeight = objDef.toHeight || 0;

		obj.args.x = objDef.x + 32;
		obj.args.yOriginal = objDef.y;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.width  = this.args.width  || 32;
		this.args.height = this.args.height || 64;
		this.args.type   = 'actor-item actor-water-fall';
		this.args.active = false;
		this.args.static = true;
	}

	onAttach()
	{
		this.autoAttr.get(this.box)['data-upward'] = 'upward';

		if(!this.viewport || !this.args.switch)
		{
			return;
		}

		this.switch = this.viewport.actorsById[ this.args.switch ];

		if(!this.switch)
		{
			return;
		}

		this.switch.args.bindTo('active', v => {
			if(v && v > 0 && !this.args.active)
			{
				this.args.active = true;
				this.onNextFrame(()=>{
					this.args.toHeight = this.args.openHeight;
					this.args.y -= this.args.openOffset;
				});
			}
		});
	}

	update()
	{
		super.update();

		if(this.args.toHeight !== this.args.height)
		{
			const diff = this.args.toHeight - this.args.height;
			const increment = Math.sign(diff) * 32;

			if(diff <= increment)
			{
				this.args.height = this.args.toHeight;
				this.args.y = this.args.yOriginal + this.args.toHeight;
			}
			else
			{
				this.args.height += increment;
				this.args.y += increment;
			}

		}
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
