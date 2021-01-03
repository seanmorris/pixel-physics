import { PointActor } from './PointActor';

export class Spring extends PointActor
{
	template = `<div
		class = "point-actor [[type]] [[collType]]"
		style = "
			--angle:[[angle]];
			--airAngle:[[airAngle]];
			--debugVector:[[debugVector]];
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
	</div>`;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-spring';

		this.args.width  = 32;
		this.args.height = 16;

		this.args.color  = this.args.color || 0;
	}

	update()
	{
		super.update();
	}

	collideA(other)
	{
		super.collideA(other);

		if(this.args.collType === 'collision-top')
		{
			other.args.ySpeed  = -20;
			other.args.ySpeed  = -this.args.power;
			other.args.falling = true;
			return true;
		}

		return true;
	}

	get canStick() { return false; }
	get solid() { return true; }
}

