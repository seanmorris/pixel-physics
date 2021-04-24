import { PointActor } from './PointActor';
import { RingMonitor } from './monitor/RingMonitor';
import { SheildWaterMonitor } from './monitor/SheildWaterMonitor';

export class QuestionBlock extends PointActor
{
	maxBounce = 4;
	float = -1;

	template = `<div
		class = "point-actor [[type]] [[collType]]"
		style = "
			display:[[display]];
			--angle:[[angle]];
			--airAngle:[[airAngle]];
			--display-angle:[[_angle]];
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
		data-empty     = "[[empty]]"
		cv-ref = "box"
	><div cv-ref = "sprite" class = "sprite"></div></div>`;

	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.x = obj.originalX = objDef.x + Math.floor(objDef.width / 2);
		obj.args.y = obj.originalY = objDef.y;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-question-block actor-item';

		this.args.width  = 32;
		this.args.height = 32;

		this.initY = null;

		this.empty = false;
	}

	collideA(other, type)
	{
		super.collideA(other);

		if(this.initY === null)
		{
			this.initY = this.y;
		}

		if(type === 2)
		{
			const impulse = Math.abs(other.args.ySpeed);

			other.args.falling = true;

			if(other.args.ySpeed > 0)
			{
				other.args.ySpeed += this.args.ySpeed;
			}
			else
			{	this.args.y  -= impulse;
				other.args.y += impulse;
			}

			if(this.args.ySpeed > 0 && this.args.ySpeed > other.args.ySpeed)
			{
				other.args.ySpeed = Math.abs(other.args.ySpeed);
				other.args.y += this.args.ySpeed;
			}

			if(this.args.ySpeed < 0)
			{
				this.args.ySpeed = -Math.abs(this.args.ySpeed);
			}

			if(this.args.ySpeed)
			{
				return true;
			}

			const ySpeedMax = this.maxBounce;

			let speed = type === 2
				? -Math.abs(other.args.ySpeed)
				: other.args.ySpeed;

			if(Math.abs(speed) > ySpeedMax)
			{
				speed = ySpeedMax * Math.sign(speed);
			}

			this.args.ySpeed = speed;

			other.args.ySpeed = -other.args.ySpeed;
		}

		if(type === 2 && !this.args.empty)
		{
			if(!this.args.empty)
			{
				const monitor = new SheildWaterMonitor({x: this.x, y: this.y - 96});

				this.viewport.spawn.add({object:monitor});

				monitor.onRemove(() => this.args.empty = false);

				this.args.empty = true;
			}
		}

		return true;
	}

	update()
	{
		if(this.initY !== null)
		{
			if(this.initY > this.y)
			{
				this.args.ySpeed += 0.75;
			}
			else if(this.initY < this.y)
			{
				this.args.ySpeed -= 0.75;
			}

			if(Math.abs(this.args.y - this.initY) < 1 && Math.abs(this.args.ySpeed) < 1)
			{
				this.args.ySpeed = 0;
				this.args.y = this.initY;
			}

		}

		this.args.ySpeed *= 0.9;

		this.args.ySpeed = Math.floor(this.args.ySpeed * 100) / 100;

		this.args.y = Math.round(this.args.y);

		const ySpeedMax = this.maxBounce;

		if(Math.abs(this.args.ySpeed) > ySpeedMax)
		{
			this.args.ySpeed = ySpeedMax * Math.sign(this.args.ySpeed);
		}

		super.update();
	}

	get canStick() { return false; }
	get solid() { return true; }
}
