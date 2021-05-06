import { PointActor } from './PointActor';
import { Region }     from '../region/Region';

export class Spring extends PointActor
{
	float = -1;

	template = `<div
		class = "point-actor actor-item [[type]] [[collType]] [[active]]"
		style = "
			display:[[display]];
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

		this.args.width  = this.args.width  || 32;
		this.args.height = this.args.height || 32;

		this.args.color  = this.args.color  || 0;
	}

	update()
	{
		super.update();

		if(this.viewport && this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/spring-activated.wav');
			this.sample.volume = 0.25 + (Math.random() * 0.1);
		}
	}

	collideA(other)
	{
		if(other instanceof this.constructor)
		{
			return false;
		}

		super.collideA(other);

		if(this.public.active)
		{
			return;
		}

		if(other instanceof Region)
		{
			return false;
		}

		if(this.viewport.args.audio && this.sample)
		{
			this.sample.currentTime = 0;
			this.sample.volume = 0.2 + (Math.random() / 4);
			this.sample.play();
		}

		const rounded = this.roundAngle(this.args.angle, 8, true);

		this.viewport.onFrameOut(3,()=>{

			this.args.active = null;

			if(other.args.ySpeed === 0 && other.args.xSpeed === 0)
			{
				if(other.controller)
				{
					other.controller.rumble({
						duration: 200,
						strongMagnitude: 1.0,
						weakMagnitude: 1.0
					});

					this.onTimeout(200, () => {
						other.controller.rumble({
							duration: 400,
							strongMagnitude: 0.0,
							weakMagnitude: 0.5
						});
					});
				}

				other.impulse(
					this.args.power
					, rounded
					, ![0, Math.PI].includes(this.args.angle)
				);
			}
		});

		other.args.direction = Math.sign(this.public.gSpeed);

		this.viewport.onFrameOut(4,()=> this.args.active = null );

		this.args.active = 'active';

		other.args.ignore = 5;
	}

	get canStick() { return false; }
	get solid() { return false; }
}

