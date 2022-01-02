import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

const Side = Symbol('Side');

export class SeeSaw extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.width  = 96;
		this.args.height = 32;

		this.noClip = true;
		this.args.float = -1;

		this.args.power = this.args.power ?? 20

		this.tiltTime = 0;

		// this.args.direction = this.args.direction || 1;

		this.args.power = this.args.power ?? 12;

		this.args.type = 'actor-item actor-see-saw';

		this.args.bindTo('tilt', v => {
			this.args.type = `actor-item actor-see-saw ${v}`
			this.tiltTime  = 0;
		});
	}

	onAttached(event)
	{
		if(!this.hub)
		{
			this.hub = new Tag('<div class = "see-saw-hub">');

			this.box.appendChild(this.hub.node);
		}
	}

	collideA(other, type)
	{
		other.args.groundAngle = 0;

		if(!other.args.falling || other.args.ySpeed <= 0)
		{
			return false;
		}

		if(Math.abs(other.x - this.x) > 4)
		{
			const newTilt = Math.sign(other.x - this.x);

			this.reflectImpulse(other, newTilt * other.args.weight * Math.abs(other.args.ySpeed));

			if(other.x < this.x)
			{
				this.tiltClass = 'tilt-left';
				this.tilt = -1;
			}
			else if(other.x > this.x)
			{
				this.tiltClass = 'tilt-right';
				this.tilt = 1;
			}

			this.args.tilt = this.tiltClass;
		}
	}

	reflectImpulse(other, direction)
	{
		if(this.reflectObject && this.reflectObject.args.falling && !other.args.falling)
		{
			return;
		}

		if(this.tilt === Math.sign(direction))
		{
			return;
		}

		this.reflectObject = other;
		this.reflectForce  = direction;
	}

	update()
	{
		this.tiltTime++;

		super.update();
	}

	updateEnd()
	{
		super.updateEnd();

		const collisions = this.viewport.collisions.get(this);

		if(!collisions)
		{
			this.reflectObject = null;
			this.reflectForce  = 0;
			return;
		}

		for(const other of collisions.keys())
		{
			other.args.groundAngle = 0;

			const armDist = other.x - this.x;
			const hang = Math.abs(armDist / (this.args.width / 2));

			const otherSide = Math.sign(armDist);

			if(!this.reflectForce || otherSide === Math.sign(this.reflectForce))
			{
				continue;
			}

			if(Math.abs(armDist) < 4)
			{
				continue;
			}

			const power  = Math.abs(this.reflectForce / other.args.weight);

			const torque = Math.min(1, Math.ceil(hang * 5) / 5);

			other.args.gSpeed = 0;

			other.args.xSpeed = 0;
			other.args.ySpeed = Math.min(-5, -power * torque * 1.2);
			other.args.y -= 16;

			other.args.falling = true;
		}

		this.reflectObject = null;
		this.reflectForce  = 0;
	}
}
