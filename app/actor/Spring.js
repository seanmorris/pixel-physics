import { PointActor } from './PointActor';

export class Spring extends PointActor
{
	template = `<div
		class = "point-actor actor-item [[type]] [[collType]]"
		style = "
			--angle:[[angle]];
			--airAngle:[[airAngle]];
			--ground-angle:[[groundAngle]];
			--height:[[height]];
			--width:[[width]];
			--x:[[x]];
			--y:[[y]];
		"
		data-colliding = "[[colliding]]"
		data-falling   = "[[falling]]"
		data-facing    = "[[facing]]"
		data-angle     = "[[angle|rad2deg]]"
		data-mode      = "[[mode]]"
	>
		<div
			data-color = "[[color]]"
			data-type  = "[[base]]"
			class      = "spring-pad"
			style = "--color:[[color]]deg"
		></div>
		<div class = "sprite"></div>
	</div>`;

	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.angle = Number(obj.args.angle);

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-spring';

		this.args.width  = 32;
		this.args.height = 32;

		this.args.color  = this.args.color || 0;

		this.args.float  = -1;
	}

	update()
	{
		super.update();
	}

	collideA(other)
	{
		super.collideA(other);

		other.args.falling = true;

		other.impulse(this.args.power, this.args.angle, true);

		return false;
	}

	get canStick() { return false; }
	get solid() { return false; }
}
