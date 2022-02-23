import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';
import { Constrainable } from '../mixin/Constrainable';

import { Ring } from './Ring';

export class Bell extends Mixin.from(PointActor, Constrainable)
{
	constructor(...args)
	{
		super(...args);

		this.args.z      = 100;

		this.args.width  = 64;
		this.args.height = 64;
		this.args.type   = 'actor-item actor-bell';

		// this.args.ropeLength = this.args._tiedTo ? this.args.ropeLength : 0;

		this.cooldown = 0;

		this.noClip = true;

		this.args.gravity = 0.40;
	}

	update()
	{
		this.xLast = this.x;
		this.yLast = this.y;

		super.update();

		if(this.cooldown > 0)
		{
			this.cooldown--;
		}

		if(this.cooldown < 1)
		{
			this.cooldown = 0;
		}

		const tiedTo = this.args.tiedTo;

		this.setPos();

		this.args.falling = true;

		const moved = this.x - this.xLast

		if(Math.abs(moved) > 1)
		{
			this.args.animation = ['ring-left', '', 'ring-right'][1 + Math.sign(this.x - this.xLast)];
		}
		else
		{
			this.args.animation = '';
		}

		if(!this.cooldown && (Math.abs(this.args.xSpeed) > 2 || Math.abs(this.args.ySpeed) > 6))
		{
			const ring = new Ring({x:this.x, y:this.y});

			ring.dropped = true;
			ring.delay   = 15;

			ring.args.static = false;
			ring.args.ignore = 20;

			ring.args.xSpeed = this.args.xSpeed;
			ring.args.ySpeed = this.args.ySpeed;

			const spawnOffset = this.rotatePoint(0, 32);

			ring.args.x += spawnOffset[0];
			ring.args.y += spawnOffset[1];

			this.viewport.spawn.add({object:ring});

			this.cooldown = 45 * Math.random() + 15;

			this.viewport.onFrameOut(120, () => {
				this.viewport.actors.remove(ring);
			});
		}
	}

	updateEnd()
	{
		if(Math.abs(this.args.xSpeed) < 3 && Math.abs(this.args.ySpeed) < 3)
		{
			if(this.viewport && !this.viewport.auras.has(this))
			{
				this.viewport.auras.add(this);
			}
		}
		else
		{
			this.viewport.auras.delete(this);
		}


		// if(this.args.tiedTo)
		// {
		// 	super.update();

		// 	if(this.args.tiedTo && this.args._tiedTo.args.hitPoints)
		// 	{
		// 		this.setPos();
		// 	}
		// 	else
		// 	{
		// 		this.noClip = true;
		// 	}
		// }


		super.updateEnd();
	}

	collideB(other)
	{
		if(!other.controllable)
		{
			return;
		}

		this.args.xSpeed = other.args.xSpeed;
		this.args.ySpeed = other.args.ySpeed;

		other.args.xSpeed *= 0.99;

		this.viewport.args.backdrop.args.sunrise = 1;
	}
}
