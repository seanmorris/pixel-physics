import { PointActor } from './PointActor';
import { Region }     from '../region/Region';

const WillSpring = Symbol('WillSpring');

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

		obj.args.width  = objDef.width  || 32;
		obj.args.height = objDef.height || 32;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-spring';

		this.args.width  = this.args.width  || 32;
		this.args.height = this.args.height || 32;

		this.args.color  = this.args.color  || 0;
		this.args.static = true;
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

		if(other.args.platform)
		{
			return;
		}

		if(other instanceof Region)
		{
			return;
		}

		this.args.active = 'active';

		if(this.viewport.args.audio && this.sample)
		{
			this.sample.currentTime = 0;
			this.sample.volume = 0.25 + (Math.random() * 0.1);
			this.sample.play();
		}

		if(other[WillSpring])
		{
			return;
		}

		this.viewport.onFrameOut(5,() => {
			delete other[WillSpring];
			this.args.active = null;
		});

		if(other.noClip)
		{
			return;
		}

		other[WillSpring] = true;

		other.args.gSpeed = 0;
		other.args.xSpeed = 0;
		other.args.ySpeed = 0;



		const rounded = this.roundAngle(this.args.angle, 8, true);

		if(other.controller)
		{
			other.controller.rumble({
				duration: 120,
				strongMagnitude: 1.0,
				weakMagnitude: 1.0
			});

			this.onTimeout(100, () => {
				other.controller.rumble({
					duration: 500,
					strongMagnitude: 0.0,
					weakMagnitude: 0.25
				});
			});
		}

		// other.args.direction = Math.sign(this.public.gSpeed);

		other.args.xSpeed = 0;
		other.args.ySpeed = 0;
		other.args.gSpeed = 0;
		other.args.float  = 2;

		other.args.x = this.x + Math.cos(rounded) * 16;
		other.args.y = this.y + Math.sin(rounded) * 16;

		other.args.jumping = false;


		other.impulse(
			this.args.power
			, rounded
			, ![0, Math.PI].includes(this.args.angle)
		);

		if(
			![0, Math.PI].includes(this.args.angle)
			|| other.args.falling
			|| other.args.mode !== 0
		){
			other.args.falling = true;
			other.args.mode = 0;
		}

		other.args.xSpeed = Math.cos(rounded) * 1;
		other.args.ySpeed = Math.sin(rounded) * 1;

		other.args.ignore = 1;

		this.onNextFrame(()=>{
			other.args.groundAngle = 0;
			if(!other.args.falling)
			{
				other.args.ignore = 8;
			}
		});
	}

	sleep()
	{
		this.args.active = null;
	}

	get canStick() { return false; }
	get solid() { return false; }
}

