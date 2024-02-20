import { Block } from './Block';
import { PointActor } from './PointActor';

const spinTime = 25;

export class Windmill extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-windmill';

		this.args.platform = true;

		this.args.width  = 128;
		this.args.height = 32;
		this.args.float  = -1;
		this.noClip      = true;

		this.spinning = false;
		this.spinFrame = 0;
		this.tossing = null;
		this.spinAngle = 0;
		this.spinDist = 0;
		this.spinDirection = 0;
	}

	tossPlayer(other, vertical = false)
	{
		if(this.spinning)
		{
			return;
		}

		const xCenter = this.args.x;
		const yCenter = this.args.y + -16;

		const xOther = xCenter - other.args.x;
		const yOther = yCenter - other.args.y;

		const dist = Math.max(Math.hypot(8, 8), Math.hypot(yOther, xOther));
		const angle = Math.atan2(yOther, xOther);

		if(dist > Math.hypot(16,64) || Math.abs(yOther) >= 64 || Math.abs(xOther) >= 64)
		{
			return;
		}

		this.ignores.set(other, spinTime + 15);
		this.args.column.ignores.set(other, spinTime + 15);

		console.log({dist,angle});

		this.spinning = true;

		other.args.falling = true;
		other.args.standingOn = null;
		other.args.float = spinTime;
		other.args.animation = 'rolling';

		this.tossing = other;
		this.spinFrame = spinTime;
		this.spinAngle = angle;
		this.spinDist = dist;

		this.spinVertical = vertical;
		this.spinDirection = (xOther < 0) ? -1 : 1;
		if(vertical)
		{
			this.spinDirection = (xOther < 0) ? 1 : -1;
		}

		other.args.xSpeed = 0;
		other.args.ySpeed = 0;
		other.args.gSpeed = 0;

		if(this.spinDirection < 0)
		{
			this.args.type = 'actor-item actor-windmill actor-windmill-spinning-back';
		}
		else
		{
			this.args.type = 'actor-item actor-windmill actor-windmill-spinning';
		}

		this.viewport.onFrameOut(spinTime + 5, () => {
			this.args.type = 'actor-item actor-windmill';
			this.spinning = false;
			this.tossing = null;
		});
	}

	collideA(other, type)
	{
		if(other.args.y > this.args.y || other.args.ySpeed < 0)
		{
			return false;
		}

		if(Math.abs(other.args.ySpeed) < Math.abs(other.args.xSpeed | other.args.gSpeed))
		{
			return true;
		}

		if(Math.abs(other.args.xSpeed || other.args.gSpeed) > 16)
		{
			return true;
		}

		if(!other.controllable)
		{
			return;
 		}

		this.tossPlayer(other);

		return true;
	}

	update()
	{
		if(this.spinFrame > 0)
		{
			const spinFrame = spinTime - this.spinFrame;
			const other = this.tossing;

			const xCenter = this.args.x;
			const yCenter = this.args.y + -16;

			const spinAngle = this.spinAngle + -((Math.PI / (spinTime * 0.5)) * spinFrame * this.spinDirection);

			other.args.x = xCenter + -Math.cos(spinAngle) * this.spinDist;
			other.args.y = yCenter + -Math.sin(spinAngle) * this.spinDist;

			this.spinFrame--;

			if(this.spinFrame === 0)
			{
				const other = this.tossing;
				const launchSpeed = Math.min(20, Math.max(17, (Math.PI / 8) * this.spinDist));

				if(this.spinVertical)
				{
					other.args.xSpeed = 0;
					other.args.ySpeed = -launchSpeed;
				}
				else
				{
					other.args.xSpeed = -launchSpeed * this.spinDirection;
					other.args.ySpeed = 0;
				}

				other.args.x += other.args.xSpeed;
				other.args.y += other.args.ySpeed;
			}
		}

		super.update();
	}

	updateStart()
	{
		if(!this.args.column)
		{
			this.args.column = new WindmillColumn({
				windmill: this
				, hidden: true
				, x: this.args.x
				, y: this.args.y + -32
				, width: 32
				, height: 48
				, float: -1
			});

			this.viewport.spawn.add({object:this.args.column});
		}
	}

	get solid() { return !this.spinning; }
}

class WindmillColumn extends Block {
	constructor(...args)
	{
		super(...args);
		this.args.type = 'actor-item actor-windmill-column';
	}
	collideA(other, type)
	{
		if(!other.controllable)
		{
			return true;
 		}

		if(Math.abs(other.args.ySpeed) > Math.abs(other.args.xSpeed))
		{
			return true;
		}

		this.args.windmill.tossPlayer(other, true);

		return true;
	}

	get solid() { return !this.args.windmill.spinning; }
}
