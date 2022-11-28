import { LayerSwitch } from './LayerSwitch';
import { PointActor } from './PointActor';
import { BreakableBlock } from './BreakableBlock';
import { Region }     from '../region/Region';
import { Sfx } from '../audio/Sfx';

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

		this.args.blocked = false;
	}

	updateEnd()
	{
		super.updateEnd();

		this.args.blocked = false;

		if(this.viewport.collisions.has(this))
		{
			for(const [third, thirdType] of this.viewport.collisions.get(this))
			{
				if(!third.broken && third instanceof BreakableBlock)
				{
					this.args.blocked = true;
				}
			}
		}
	}

	collideA(other, type)
	{
		if(this.args.blocked)
		{
			return false;
		}

		if(other.carriedBy)
		{
			return false;
		}

		if(other.args.hangingFrom)
		{
			other.args.hangingFrom.unhook();
		}

		if(other[WontSpring])
		{
			return false;
		}

		if(other.args.static)
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

		super.collideA(other, type);

		if(this.args.actingOn.has(other))
		{
			return false;
		}

		if(other.args.platform)
		{
			return false;
		}

		if(other instanceof Region)
		{
			return false;
		}

		Sfx.play('SPRING_HIT');

		if(other[WillSpring])
		{
			return false;
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
			return false;
		}

		// other.args.direction = Math.sign(this.args.gSpeed);

		other[WillSpring] = true;

		other.args.mercy  = 0;
		other.args.gSpeed = 0;
		other.args.xSpeed = 0;
		other.args.ySpeed = 0;

		const rounded = this.roundAngle(this.args.angle, 8, true);

		if(this.viewport.settings.rumble && other.controller && other.controller.rumble)
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

		other.args.x = this.args.x + Math.cos(rounded) * 4;
		other.args.y = this.args.y + Math.sin(rounded) * 4;

		other.locked = 2;

		other.args.jumping = false;
		other.args.ignore = other.args.ignore || (other.args.falling ? 12 : 2);
		other.args.float = 2;

		this.viewport.onFrameOut(1,()=>{
			other.args.float = 2;
			other.args.mode = 0;
			other.args.direction = Math.sign(xImpulse) || other.args.direction;

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
			// this.viewport.onFrameOut(4, () => other.args.rolling = isRolling);
			// this.viewport.onFrameOut(3, () => other.args.rolling = isRolling);
			// this.viewport.onFrameOut(2, () => other.args.rolling = isRolling);
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
		other.args.mode = 0;

		return false;
	}

	sleep()
	{
		this.args.actingOn.clear();

		this.args.active = false;
	}

	get canStick() { return false; }
	get solid() { return false; }
}
