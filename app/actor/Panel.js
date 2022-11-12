import { PointActor } from './PointActor';
import { Bindable } from 'curvature/base/Bindable';

export class Panel extends PointActor
{
	constructor(args, parent)
	{
		super(args,parent);

		this.args.type = 'actor-item actor-panel';

		this.args.width  = 64;
		this.args.height = 8;
		this.args.static = 1;

		this.args.float = -1;

		this.leaving = new Set;
		this.holding = new Set;

		this.cancels = new Map;

		// this.args.bindTo('mode', (k,v) => console.trace(this.args.id,k,v));
	}

	collideA(other, type)
	{
		if(other.canFly)
		{
			return false;
		}

		if(this.leaving.has(other))
		{
			if(this.holding.has(other))
			{
				other.stayStuck = false;
				other.willStick = false;
				other.willJump  = false;
				other.args.gSpeed  = 0;

				this.holding.delete(other);
			}

			if(this.cancels.has(other))
			{
				this.cancels.get(other)();
				this.cancels.delete(other);
			}

			this.cancels.set(other, this.viewport.onFrameOut(25, () => {
				this.holding.delete(other);
				this.leaving.delete(other);
			}));


			return false;
		}

		if(!other.args.jumping && !this.holding.has(other))
		{
			return false;
		}

		if(this.holding.has(other))
		{
			other.args.mode = 0;
			other.args.groundAngle = this.args.groundAngle;
			other.lastAngles.length = 0;

			other.args.gSpeed = 0;
			other.args.xSpeed = 0;
			other.args.ySpeed = 0;

			other.args.falling = false;

			if(this.args.next && this.holding.has(other) && other.willJump)
			{
				const nextPanel = this.viewport.actorsById[ this.args.next ];

				other.args.falling = true;

				if(nextPanel)
				{
					other.stayStuck = true;
					other.willStick = true;
					// other.willJump = false;

					const point = nextPanel.rotatePoint(0, 0);

					const angle = other.angleTo({
						x:point[0]+nextPanel.x
						, y:point[1]+nextPanel.y
					});

					other.args.gSpeed = 0;

					other.args.x -= Math.cos(angle) * 16;
					other.args.y -= Math.sin(angle) * 16;

					other.args.xSpeed = -Math.cos(angle) * 34;
					other.args.ySpeed = -Math.sin(angle) * 34;

					other.args.falling = true;
					other.args.jumping = true;
					other.args.float = 45;

					this.leaving.add(other);
					this.holding.delete(other);

					other.args.ignore = 45;
				}
				else
				{
					this.leaving.add(other);
					this.holding.delete(other);

					other.stayStuck = false;
					other.willStick = false;
					// other.willJump  = false;
					other.args.gSpeed = 0;
					other.args.xSpeed = 0;
					other.args.ySpeed = 0;

					other.args.falling = true;

					other.args.ignore = 15;
				}

				return false;
			}

			const point = this.rotatePoint(0, 8);

			console.log(point);

			other.args.x = this.x + point[0];
			other.args.y = this.y + point[1];

			other.args.ignore = 0;

		 	return false;
		}

		const nextPanel = this.others.next;

		if(nextPanel)
		{
			this.holding.add(other);
		}
		else
		{
			return true;
		}

		// other.args.gSpeed = 0;
		// other.args.xSpeed = 0;
		// other.args.ySpeed = 0;

		other.args.ignore = 10;

		if(this.cancels.has(other))
		{
			this.cancels.get(other)();
			this.cancels.delete(other);
		}

		this.cancels.set(other, this.viewport.onFrameOut(20, () => {
			if(this.holding.has(other))
			{
				this.holding.delete(other);
				this.leaving.add(other);
			}
		}));

		return false;
	}

	sleep()
	{
		this.leaving.clear();
		this.holding.clear();
	}

	get solid() { return false; }
}
