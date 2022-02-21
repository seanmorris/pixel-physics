import { Balloon } from './Balloon';
import { Spring } from './Spring';

export class StarBalloon extends Balloon
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-balloon actor-star-balloon';

		this.args.target = this.args.target || 0;

		this.args.gravity = 0.475;

		this[Spring.WontSpring] = true;
	}

	update()
	{
		super.update();

		if(!this.popped)
		{
			if(!this.launched)
			{
				this.args.ySpeed = Math.sin(this.viewport.args.frameId / 10) / 5;
			}
			else
			{
				const maxSpeed = this.args.target - this.y;

				this.args.ySpeed = Math.min(8, Math.abs(maxSpeed)) * Math.sign(maxSpeed);
			}
		}

		this.args.groundAngle = 0;

	}

	activate()
	{
		this.launched = true;
	}

	collideA(other)
	{
		if(!other.controllable || other.args.hangingFrom)
		{
			return false;
		}

		if(this.popped)
		{
			return false;
		}

		if(other.args.ySpeed >= 0 || other.args.spinning)
		{
			other.args.ySpeed = -14;

			this.pop();
		}
	}

	sleep()
	{
		this.tags.sprite && this.tags.sprite.classList.remove('popped');

		this.args.x = this.def.get('x');
		this.args.y = this.def.get('y');

		this.args.xSpeed = 0;
		this.args.ySpeed = 0;

		this.args.float = -1;

		this.popped = this.launched = false;

		this.args.falling = true;

		this.viewport.setColCell(this);

		this.noClip = false;
	}

	damage()
	{
		this.pop();
	}

	pop()
	{
		const exploded = new CustomEvent('exploded', {detail: {actor:this}});

		this.dispatchEvent(exploded);

		this.tags.sprite.classList.add('popped');

		this.popped = true;

		this.args.float = 0;

		this.noClip = true;
	}
}
