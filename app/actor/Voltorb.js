import { GohlaBall } from '../actor/GohlaBall';

export class Voltorb extends GohlaBall
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-gohla-ball actor-voltorb';
	}

	update()
	{
		super.update();

		if(!this.viewport)
		{
			return;
		}

		if(!this.viewport.controlActor)
		{
			return;
		}

		const player = this.viewport.controlActor;

		this.direction = Math.sign(this.x - player.x);

		this.args.facing = this.direction < 0 ? 'left' : 'right';

		if(Math.abs(player.y - this.y) <= 16)
		{
			if(Math.abs(player.x - this.x) < 34)
			{
				this.args.animation = 'sparking';

				player.damage(this, 'electric');
			}
			else if(!player.args.dead && !player.args.mercy)
			{
				this.args.animation = 'standing';
			}
		}
		else if(!player.args.dead && !player.args.mercy)
		{
			this.args.animation = 'standing';
		}
	}
}
