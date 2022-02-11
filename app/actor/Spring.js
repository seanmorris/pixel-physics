import { LayerSwitch } from './LayerSwitch';
import { PointActor } from './PointActor';
import { Region }     from '../region/Region';

const WillSpring = Symbol('WillSpring');
const WontSpring = Symbol('WontSpring');

export class Spring extends PointActor
{
	static WontSpring = WontSpring;

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
		data-diagonal  = "[[diagonal]]"
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

		this.args.actingOn = new Set;
	}

	update()
	{
		super.update();

		if(this.viewport && this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/spring-activated.wav');
			this.sample.volume = 0.05 + (Math.random() * 0.1);
		}
	}

	collideA(other)
	{
		if(other[WontSpring])
		{
			return false;
		}

		if(other instanceof this.constructor)
		{
			return false;
		}

		if(other instanceof LayerSwitch)
		{
			return false;
		}

		super.collideA(other);

		if(this.args.actingOn.has(other))
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

		if(this.viewport.args.audio && this.sample)
		{
			this.sample.currentTime = 0;
			this.sample.volume = 0.05 + (Math.random() * 0.1);
			this.sample.play();
		}

		if(other[WillSpring])
		{
			return;
		}

		this.args.actingOn.add(other)

		this.viewport.onFrameOut(1, () => {
			this.args.active = true;
		});

		this.viewport.onFrameOut(5,() => {
			delete other[WillSpring];
			this.args.active = false;
			this.args.actingOn.delete(other);
		});

		if(other.noClip)
		{
			return;
		}

		// other.args.direction = Math.sign(this.args.gSpeed);

		other[WillSpring] = true;

		other.args.gSpeed = 0;
		other.args.xSpeed = 0;
		other.args.ySpeed = 0;

		const rounded = this.roundAngle(this.args.angle, 8, true);

		if(other.controller && other.controller.rumble)
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

		other.args.x = this.x + Math.cos(rounded) * 16;
		other.args.y = this.y + Math.sin(rounded) * 16;

		other.args.jumping = false;
		other.args.ignore = other.args.falling ? 4 : 12;
		other.args.float = 2;

		this.viewport.onFrameOut(2,()=>{

			other.args.float = 2;
			other.args.direction = Math.sign(xImpulse);

			other.impulse(
				this.args.power
				, rounded
				, (![0, Math.PI].includes(this.args.angle) && Math.abs(Math.PI - this.args.angle) > 0.01)
			);
		});

		const xImpulse = Number(Number(Math.cos(rounded) * 1).toFixed(3));
		const yImpulse = Number(Number(Math.sin(rounded) * 1).toFixed(3));

		const isRolling = other.args.rolling;

		if(
			(![0, Math.PI].includes(this.args.angle) && Math.abs(Math.PI - this.args.angle) > 0.01)
			|| other.args.falling
			|| other.args.mode !== 0
		){
			other.args.falling = true;
			other.args.mode = 0;
		}
		else
		{
			this.viewport.onFrameOut(3, () => other.args.rolling = isRolling);
			this.viewport.onFrameOut(2, () => other.args.rolling = isRolling);
			this.viewport.onFrameOut(1, () => other.args.rolling = isRolling);
		}


		if(Math.abs(other.args.xSpeed) < 3 || Math.sign(other.args.xSpeed) !== Math.sign(xImpulse))
		{
			other.args.xSpeed = xImpulse;
		}
		else
		{
			other.args.xSpeed += xImpulse;
		}

		if(Math.abs(other.args.ySpeed) < 3 || Math.sign(other.args.ySpeed) !== Math.sign(yImpulse))
		{
			other.args.ySpeed = yImpulse;
		}
		else
		{
			other.args.ySpeed += yImpulse;
		}

		other.args.airAngle = this.args.angle;
		other.args.displayAngle = 0;
		other.args.groundAngle = 0;
		other.args.airAngle = -Math.PI / 2;
	}

	sleep()
	{
		this.args.actingOn.clear();

		this.args.active = false;
	}

	get canStick() { return false; }
	get solid() { return false; }
}
